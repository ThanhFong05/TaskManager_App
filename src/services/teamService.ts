import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebase';
import { Team, TeamMember, Task, UserProfile } from '../types';

const TEAMS_COLLECTION = 'teams';
const TEAM_MEMBERS_COLLECTION = 'teamMembers';
const TASKS_COLLECTION = 'tasks';

// Helper: Generate a short, memorable team code (e.g. TF-8492)
export const generateTeamCode = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TF-${randomPart}`;
};

// 1. Create a new Team
export const createTeam = async (
  name: string,
  description: string,
  user: { id: string; name: string; email: string }
): Promise<Team> => {
  const now = Date.now();
  const shortCode = generateTeamCode();

  // Create team document with short code
  const teamDocRef = await addDoc(collection(db, TEAMS_COLLECTION), {
    name: name.trim(),
    description: description.trim(),
    code: shortCode,
    ownerId: user.id,
    createdAt: now,
  });

  const teamId = teamDocRef.id;

  // Add creator as owner in teamMembers collection
  const memberId = `${teamId}_${user.id}`;
  await setDoc(doc(db, TEAM_MEMBERS_COLLECTION, memberId), {
    id: memberId,
    teamId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: 'owner',
    joinedAt: now,
  });

  return {
    id: teamId,
    code: shortCode,
    name: name.trim(),
    description: description.trim(),
    ownerId: user.id,
    createdAt: now,
  };
};

// 2. Join an existing team by short Code (e.g. TF-8492, L5PSFP) or full ID
export const joinTeam = async (
  codeOrId: string,
  user: { id: string; name: string; email: string }
): Promise<{ success: boolean; message: string; team?: Team }> => {
  const cleanInput = codeOrId.trim().toUpperCase();
  let targetTeamDoc: any = null;
  let targetTeamId = '';
  let finalCode = cleanInput;

  // Attempt 1: Lookup by explicit 'code' field
  try {
    const codeQuery = query(
      collection(db, TEAMS_COLLECTION),
      where('code', '==', cleanInput)
    );
    const codeSnapshot = await getDocs(codeQuery);
    if (!codeSnapshot.empty) {
      targetTeamDoc = codeSnapshot.docs[0];
      targetTeamId = targetTeamDoc.id;
      finalCode = targetTeamDoc.data().code || cleanInput;
    }
  } catch (e) {
    console.warn('Code query failed:', e);
  }

  // Attempt 2: Lookup by exact doc ID
  if (!targetTeamDoc) {
    try {
      const docRef = doc(db, TEAMS_COLLECTION, codeOrId.trim());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        targetTeamDoc = docSnap;
        targetTeamId = docSnap.id;
        finalCode = docSnap.data().code || targetTeamId.substring(0, 6).toUpperCase();
      }
    } catch (e) {
      // not a valid doc id or other error
    }
  }

  // Attempt 3: Prefix / ID substring matching across all teams (matches e.g. "L5PSFP")
  if (!targetTeamDoc) {
    try {
      const allTeamsSnapshot = await getDocs(collection(db, TEAMS_COLLECTION));
      for (const tSnap of allTeamsSnapshot.docs) {
        const tData = tSnap.data();
        const tIdUpper = tSnap.id.toUpperCase();
        const tCodeUpper = (tData.code || '').toUpperCase();

        if (
          tCodeUpper === cleanInput ||
          tIdUpper === cleanInput ||
          tIdUpper.startsWith(cleanInput) ||
          tIdUpper.substring(0, 6) === cleanInput
        ) {
          targetTeamDoc = tSnap;
          targetTeamId = tSnap.id;
          finalCode = tData.code || cleanInput;

          // Backfill code in Firestore if it was missing
          if (!tData.code) {
            try {
              await updateDoc(doc(db, TEAMS_COLLECTION, targetTeamId), { code: finalCode });
            } catch (err) {}
          }
          break;
        }
      }
    } catch (e) {
      console.warn('Prefix search error:', e);
    }
  }

  if (!targetTeamDoc) {
    return { success: false, message: `Team code "${codeOrId}" not found. Please verify the code.` };
  }

  // Check if user is already a member
  const memberId = `${targetTeamId}_${user.id}`;
  const memberDocRef = doc(db, TEAM_MEMBERS_COLLECTION, memberId);
  const memberSnap = await getDoc(memberDocRef);

  if (memberSnap.exists()) {
    return { success: false, message: 'You are already a member of this team.' };
  }

  // Add user to teamMembers
  const now = Date.now();
  await setDoc(memberDocRef, {
    id: memberId,
    teamId: targetTeamId,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    role: 'member',
    joinedAt: now,
  });

  const teamData = targetTeamDoc.data();
  return {
    success: true,
    message: 'Successfully joined team!',
    team: {
      id: targetTeamId,
      code: finalCode,
      name: teamData.name,
      description: teamData.description,
      ownerId: teamData.ownerId,
      createdAt: teamData.createdAt,
    },
  };
};

// 3. Subscribe to the Teams the current user belongs to
export const subscribeToUserTeams = (
  userId: string,
  callback: (teams: Team[]) => void
) => {
  const q = query(
    collection(db, TEAM_MEMBERS_COLLECTION),
    where('userId', '==', userId)
  );

  return onSnapshot(q, async (snapshot) => {
    const teamIds = snapshot.docs.map((docSnap) => docSnap.data().teamId as string);

    if (teamIds.length === 0) {
      callback([]);
      return;
    }

    try {
      const teamsList: Team[] = [];
      for (const tid of teamIds) {
        const tDoc = await getDoc(doc(db, TEAMS_COLLECTION, tid));
        if (tDoc.exists()) {
          const data = tDoc.data();
          let teamCode = data.code;
          if (!teamCode) {
            teamCode = tDoc.id.substring(0, 6).toUpperCase();
            try {
              await updateDoc(doc(db, TEAMS_COLLECTION, tDoc.id), { code: teamCode });
            } catch (err) {}
          }

          teamsList.push({
            id: tDoc.id,
            code: teamCode,
            name: data.name,
            description: data.description,
            ownerId: data.ownerId,
            createdAt: data.createdAt,
          });
        }
      }
      callback(teamsList);
    } catch (error) {
      console.error('Error fetching user teams:', error);
      callback([]);
    }
  });
};

// 4. Subscribe to Members of a specific Team
export const subscribeToTeamMembers = (
  teamId: string,
  callback: (members: TeamMember[]) => void
) => {
  const q = query(
    collection(db, TEAM_MEMBERS_COLLECTION),
    where('teamId', '==', teamId)
  );

  return onSnapshot(q, (snapshot) => {
    const members: TeamMember[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        teamId: data.teamId,
        userId: data.userId,
        userName: data.userName,
        userEmail: data.userEmail,
        role: data.role,
        joinedAt: data.joinedAt,
      };
    });
    callback(members);
  });
};

// 5. Subscribe to Tasks of a specific Team
export const subscribeToTeamTasks = (
  teamId: string,
  callback: (tasks: Task[]) => void
) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('teamId', '==', teamId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        createdAt: data.createdAt,
        creatorId: data.creatorId || null,
        teamId: data.teamId,
        teamName: data.teamName,
        assigneeId: data.assigneeId,
        assigneeName: data.assigneeName,
      } as Task;
    });
    tasks.sort((a, b) => b.createdAt - a.createdAt);
    callback(tasks);
  });
};

// 6. Get all available public teams for selection / discovery
export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const q = query(collection(db, TEAMS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        code: data.code || docSnap.id.substring(0, 6).toUpperCase(),
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        createdAt: data.createdAt,
      };
    });
  } catch (error) {
    console.error('Error fetching all teams:', error);
    return [];
  }
};
