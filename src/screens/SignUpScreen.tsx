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
import { registerUser } from '../services/authService';

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Separated states for independent eye toggle!
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignUp = async () => {
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await registerUser(name, email, password);
    } catch (error: any) {
      console.error('Sign up error:', error);
      let msg = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        msg = 'This email is already registered. Please sign in instead.';
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        msg = 'Password is too weak. Please use at least 6 characters.';
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
        {/* TaFo Header */}
        <Surface style={[styles.headerCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <View style={[styles.logoBadge, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons
              name="account-plus-outline"
              size={48}
              color={theme.colors.primary}
            />
          </View>
          <Text variant="headlineLarge" style={[styles.appName, { color: theme.colors.primary }]}>
            TaFo
          </Text>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
            Create Your Account
          </Text>
        </Surface>

        {/* Form Card */}
        <Surface style={[styles.formCard, { backgroundColor: theme.colors.surface }]} elevation={2}>
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errorMessage) setErrorMessage('');
            }}
            mode="outlined"
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="account-outline" color={theme.colors.onSurfaceVariant} />}
            style={[styles.input, { backgroundColor: theme.colors.surface }]}
          />

          <TextInput
            label="Email Address *"
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

          {/* Password Input with its own toggle */}
          <TextInput
            label="Password (min. 6 chars) *"
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

          {/* Confirm Password Input with its OWN INDEPENDENT toggle */}
          <TextInput
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errorMessage) setErrorMessage('');
            }}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            outlineColor={theme.colors.outline}
            activeOutlineColor={theme.colors.primary}
            left={<TextInput.Icon icon="lock-check-outline" color={theme.colors.onSurfaceVariant} />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
            onPress={handleSignUp}
            loading={loading}
            disabled={loading}
            style={[styles.signUpButton, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Create Account
          </Button>

          <View style={styles.footerRow}>
            <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.primary, fontWeight: 'bold' }}
              >
                Sign In
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
  input: {
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    marginBottom: 8,
  },
  signUpButton: {
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

export default SignUpScreen;
