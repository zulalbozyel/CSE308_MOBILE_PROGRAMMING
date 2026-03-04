import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const COLORS = {
  primary: '#3E2723',   // dark brown primary color
  background: '#F5F5F5', // light gray background
  accent: '#FFC107', // accent color for buttons and highlights
  textDark: '#212121', // main text color
  textLight: '#757575', // lighter text color for placeholders and secondary text
  inputBg: '#FFFFFF', // input background color
  error: '#D32F2F', // error color for validation
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  
  const handleLogin = () => {
    // email check by regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i;

    if (!email) {
      setEmailError('E-posta adresi boş bırakılamaz.');
      return;
    }

    if (!emailRegex.test(email)) {
      setEmailError('Lütfen sonu .com ile biten geçerli bir e-posta giriniz.');
      return;
    }

    
    console.log('Giriş Başarılı, Email:', email);
    // router.push add later to navigation
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="cafe" size={60} color={COLORS.accent} />
          </View>
          <Text style={styles.logoText}>ROASTERY</Text>
          <Text style={styles.subtitleText}>En iyi kahve deneyimi için giriş yapın.</Text>
        </View>

        <View style={styles.formContainer}>
          
          {/* E-POSTA INPUTU */}
          <View style={[
            styles.inputContainer, 
            emailError ? styles.inputErrorBorder : null // email checkk
          ]}>
            <Ionicons name="mail-outline" size={20} color={emailError ? COLORS.error : COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="E-posta Adresiniz"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(''); // hide error when input given
              }}
            />
          </View>
          
          {/* HATA MESAJI GÖSTERİMİ */}
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Şifreniz"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={handleLogin} 
          >
            <Text style={styles.primaryButtonText}>GİRİŞ YAP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Hesabınız yok mu? </Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>Hemen Kayıt Ol</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoCircle: {
    width: 100,
    height: 100,
    backgroundColor: COLORS.primary,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 4,
  },
  subtitleText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  inputErrorBorder: {
    borderColor: COLORS.error, // email format checkkkkk
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: 5,
    fontWeight: '500',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  primaryButtonText: {
    color: COLORS.accent, 
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: COLORS.textLight,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: 'bold',
  },
});