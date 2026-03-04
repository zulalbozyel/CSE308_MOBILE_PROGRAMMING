import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

const COLORS = {
  primary: '#3E2723', // Koyu Espresso
  accent: '#FFC107',  // Hardal Sarısı
  background: '#F5F5F5',
};

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    // Uygulama açıldıktan 2.5 saniye sonra Login ekranına geçiş yap
    const timer = setTimeout(() => {
      // DİKKAT: 'push' yerine 'replace' kullanıyoruz. 
      // Böylece kullanıcı Login ekranındayken telefonun geri tuşuna basarsa tekrar Splash ekrana dönmez, uygulamadan çıkar. (Tam bir Senior detayı!)
      router.replace('/login'); 
    }, 2500);

    // Component unmount olduğunda timer'ı temizle (Memory leak olmaması için iyi bir pratik)
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      
      <View style={styles.logoCircle}>
        <Ionicons name="cafe" size={80} color={COLORS.primary} />
      </View>
      
      <Text style={styles.logoText}>ROASTERY</Text>
      <Text style={styles.subtitle}>Premium Kahve Deneyimi</Text>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary, // Tüm ekranı vurucu koyu kahve yapıyoruz
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 140,
    height: 140,
    backgroundColor: COLORS.accent, // Hardal sarısı daire içinde espresso ikon
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: COLORS.accent,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.background,
    marginTop: 10,
    letterSpacing: 1,
    opacity: 0.8,
  }
});