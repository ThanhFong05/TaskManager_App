import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  useTheme,
  HelperText,
  Surface,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loginUser } from '../services/authService';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      let msg = 'Failed to sign in. Please verify your credentials.';
      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/invalid-credential'
      ) {
        msg = 'Incorrect email or password.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Too many failed login attempts. Please try again later.';
      }
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* TaFo Brand Header Card */}
        <Surface style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={[styles.logoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.primary }]}>
            TaFo
          </Text>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Task Focus • Team Collaboration
          </Text>
        </Surface>

        {/* Login Form Card */}
        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <Text variant="titleMedium" style={[styles.formTitle, { color: theme.colors.onSurface }]}>
            Welcome Back!
          </Text>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 20 }}>
            Sign in to access your team tasks and chats
          </Text>

          <TextInput
            label="Email Address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errorMessage) setErrorMessage('');
            }}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="email-outline" color={theme.colors.onSurfaceVariant} />}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            mode="outlined"
            secureTextEntry={!showPassword}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="lock-outline" color={theme.colors.onSurfaceVariant} />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
                color={theme.colors.onSurfaceVariant}
              />
            }
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
          />

          {errorMessage ? (
            <HelperText type="error" visible={!!errorMessage} style={styles.errorText}>
              {errorMessage}
            </HelperText>
          ) : null}

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Sign In
          </Button>

          <View style={styles.footerRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 32,
  },
  headerCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  appName: {
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  formCard: {
    padding: 24,
    borderRadius: 20,
  },
  formTitle: {
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 12,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
  },
  loginButton: {
    marginTop: 10,
    borderRadius: 12,
    elevation: 2,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
