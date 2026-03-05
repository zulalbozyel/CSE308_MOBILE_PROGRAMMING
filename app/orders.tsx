import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
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
  inputBg: "#FFFFFF",
};

export default function OrdersScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Siparişlerim</Text>

        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <Text style={styles.placeholderText}>Henüz siparişiniz yok.</Text>
      </ScrollView>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="home-outline"
          label="Ana Sayfa"
          onPress={() => router.push("/home")}
        />
        <NavItem
          icon="restaurant-outline"
          label="Menü"
          onPress={() => router.push("/menu")}
        />
        <NavItem icon="receipt-outline" label="Siparişlerim" />
        <NavItem
          icon="person-outline"
          label="Profilim"
          onPress={() => router.push("/profile")}
        />
      </View>
    </SafeAreaView>
  );
}

const NavItem = ({ icon, label, onPress }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={COLORS.primary} />
    <Text style={styles.navText}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.inputBg,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 12,
    backgroundColor: COLORS.inputBg,
    borderTopWidth: 0.5,
    borderColor: "#ddd",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: COLORS.textDark,
  },
});
