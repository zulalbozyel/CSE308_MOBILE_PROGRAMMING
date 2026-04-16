import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

const COLORS = {
  primary: '#3E2723',
  background: '#F5F5F5',
  accent: '#FFC107',
  textDark: '#212121',
  textLight: '#757575',
  inputBg: '#FFFFFF',
  error: '#D32F2F',
};

export default function SignUpScreen() {
  const router = useRouter();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      Alert.alert("Hata", "Lütfen tüm alanları doldurun.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor!");
      return;
    }
    
    setLoading(true);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert("Kayıt Başarısız", error.message);
    } else {
      Alert.alert("Başarılı!", "Hesabınız oluşturuldu. Lütfen giriş yapın.");
      router.replace('/login');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.logoText}>ROASTERY</Text>
          <Text style={styles.subtitleText}>Aramıza katılın, kahvenin tadını çıkarın.</Text>
        </View>

        <View style={styles.formContainer}>
          
          {/* AD SOYAD INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Ad Soyad"
              placeholderTextColor={COLORS.textLight}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* E-POSTA INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="E-posta Adresiniz"
              placeholderTextColor={COLORS.textLight}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* ŞİFRE INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Şifreniz"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={22} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          {/* ŞİFRE TEKRAR INPUT */}
          <View style={styles.inputContainer}>
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.textLight} style={styles.icon} />
            <TextInput 
              style={styles.input}
              placeholder="Şifrenizi Tekrar Girin"
              placeholderTextColor={COLORS.textLight}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleSignUp} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "KAYIT OLUNUYOR..." : "KAYIT OL"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Zaten hesabınız var mı? </Text>
          <TouchableOpacity onPress={() => router.replace('/login')}>
            <Text style={styles.footerLink}>Giriş Yap</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
  headerContainer: { alignItems: 'center', marginBottom: 40 },
  logoText: { fontSize: 32, fontWeight: '800', color: COLORS.primary, letterSpacing: 4 },
  subtitleText: { fontSize: 14, color: COLORS.textLight, marginTop: 8 },
  formContainer: { width: '100%' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBg, borderRadius: 12, marginBottom: 16, paddingHorizontal: 15, height: 60, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: 'transparent' },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.textDark },
  primaryButton: { backgroundColor: COLORS.primary, borderRadius: 12, height: 60, justifyContent: 'center', alignItems: 'center', marginTop: 10, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  primaryButtonText: { color: COLORS.accent, fontSize: 18, fontWeight: 'bold', letterSpacing: 1.5 },
  footerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: COLORS.textLight, fontSize: 15 },
  footerLink: { color: COLORS.primary, fontSize: 15, fontWeight: 'bold' },
});