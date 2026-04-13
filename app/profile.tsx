import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  card: "#FFFFFF",
  inputBg: "#FFFFFF",
};
export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFİL BİLGİLERİ */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: `https://avatar.iran.liara.run/public/boy?username=${user?.user_metadata?.full_name || user?.email || 'User'}` }} // Geçici avatar resmi
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.user_metadata?.full_name || "Kullanıcı"}</Text>
            <Text style={styles.email}>{user?.email || "E-posta bulunamadı"}</Text>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SADAKAT PROGRAMI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sadakat Programı</Text>
          <Text style={styles.loyaltyText}>10 kahve alana 1 kahve bedava!</Text>
          <View style={styles.loyaltyRow}>
            <TouchableOpacity style={styles.loyaltyButton}>
              <Ionicons name="star-outline" size={18} color="#fff" />
              <Text style={styles.loyaltyButtonText}>Puan Kazan</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loyaltyButton}>
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text style={styles.loyaltyButtonText}>QR Göster</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* HESAP AYARLARI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap Ayarları</Text>
          <TouchableOpacity style={styles.option} onPress={() => router.push("/orders")}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Sipariş Geçmişi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Ödeme Yöntemleri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Şifre Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* UYGULAMA AYARLARI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama ve Diğer</Text>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.optionText}>Bildirim Ayarları</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#ccc", true: COLORS.accent }}
              thumbColor={notifications ? COLORS.primary : "#fff"}
            />
          </View>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Yardım ve Destek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Hak ve Şartlar</Text>
          </TouchableOpacity>
        </View>

        {/* TEHLİKELİ İŞLEMLER */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="home-outline"
          label="Ana Sayfa"
          onPress={() => router.push("/home")}
          active={false}
        />
        <NavItem
          icon="restaurant-outline"
          label="Menü"
          onPress={() => router.push("/menu")}
          active={false}
        />
        <NavItem
          icon="receipt-outline"
          label="Siparişlerim"
          onPress={() => router.push("/orders")}
          active={false}
        />
        <NavItem icon="person" label="Profilim" active={true} />
      </View>
    </SafeAreaView>
  );
}

// Navigasyon componenti: Diğer sayfalardaki gibi 'active' durumunu destekler
const NavItem = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={active ? COLORS.accent : COLORS.textLight} />
    <Text style={[styles.navText, { color: active ? COLORS.primary : COLORS.textLight, fontWeight: active ? "700" : "400" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Alt navigasyon barı için boşluk
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ddd",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  email: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: COLORS.accent,
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: COLORS.primary,
  },
  loyaltyText: {
    color: COLORS.textDark,
    marginBottom: 15,
    fontSize: 14,
  },
  loyaltyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  loyaltyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 0.48, // Butonların eşit genişlikte olması için
    justifyContent: 'center'
  },
  loyaltyButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  optionText: {
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.textDark,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#FDECEA",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteText: {
    color: "#D32F2F",
    fontWeight: "700",
    fontSize: 15,
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: COLORS.inputBg,
    borderTopWidth: 1,
    borderColor: "#EEE",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});