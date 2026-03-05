import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";


const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  card: "#FFFFFF",
};

export default function Profile() {
  const [notifications, setNotifications] = React.useState(true);
  const router = useRouter();
  // alt naigasyon barı için router ekledim, diğer sayfalara geçiş yapabilmek için.
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* LOYALTY PROGRAM */}
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

        {/* ACCOUNT SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap Ayarları</Text>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Sipariş Geçmişi</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Ödeme Yöntemleri</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.optionText}>Şifre Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* APP SETTINGS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama ve Diğer</Text>

          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={COLORS.primary}
              />
              <Text style={styles.optionText}>Bildirim Ayarları</Text>
            </View>

            <Switch value={notifications} onValueChange={setNotifications} />
          </View>

          <TouchableOpacity style={styles.option}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.optionText}>Yardım ve Destek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option}>
            <Ionicons
              name="document-text-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.optionText}>Hak ve Şartlar</Text>
          </TouchableOpacity>
        </View>

        {/* DANGER ZONE */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>Hesap Sil</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>PROFIL</Text>

          <View style={{ width: 24 }} />
        </View>
      </ScrollView>
      {/* NAVBAR */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/")}
        >
          <Ionicons name="home-outline" size={22} color={COLORS.textLight} />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/orders")}
        >
          <Ionicons name="book-outline" size={22} color={COLORS.textLight} />
          <Text style={styles.navText}>Menü</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/orders")}
        >
          <Ionicons name="receipt-outline" size={22} color={COLORS.textLight} />
          <Text style={styles.navText}>Siparişlerim</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person" size={22} color={COLORS.primary} />
          <Text style={[styles.navText, { color: COLORS.primary }]}>
            Profilim
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  profileSection: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ddd",
    marginRight: 15,
  },

  profileInfo: {
    flex: 1,
    justifyContent: "center",
  },

  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
  },

  email: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },

  editButton: {
    marginTop: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  editButtonText: {
    color: COLORS.accent,
    fontWeight: "600",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: COLORS.primary,
  },

  loyaltyText: {
    color: COLORS.textDark,
    marginBottom: 12,
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
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  loyaltyButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
  },

  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  deleteButton: {
    backgroundColor: "#FDECEA",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },

  deleteText: {
    color: "#D32F2F",
    fontWeight: "700",
  },

  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  logoutText: {
    color: COLORS.accent,
    fontWeight: "700",
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.textLight,
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
});
