import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  SafeAreaView,
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
  success: "#2E7D32",
  pending: "#EF6C00",
};

// Tasarımı görebilmek için sahte veri (Mock Data)
const MOCK_ORDERS = [
  {
    id: "101",
    date: "5 Mart 2026, 14:30",
    status: "Hazırlanıyor",
    items: "2x Iced Latte, 1x Çikolatalı Cookie",
    totalPrice: 165,
  },
  {
    id: "100",
    date: "3 Mart 2026, 09:15",
    status: "Teslim Edildi",
    items: "1x Americano, 1x Kruvasan",
    totalPrice: 110,
  },
  {
    id: "099",
    date: "1 Mart 2026, 16:45",
    status: "Teslim Edildi",
    items: "1x Filtre Kahve",
    totalPrice: 45,
  },
];

export default function OrdersScreen() {
  const router = useRouter();
  // Gerçek projede API'den gelen veriyi bu state'e atarsın
  const [orders, setOrders] = useState(MOCK_ORDERS);

  // Kart tasarımını render eden fonksiyon
  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Sipariş #{item.id}</Text>
        <Text style={styles.orderDate}>{item.date}</Text>
      </View>

      <Text style={styles.itemsText}>{item.items}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.totalPrice}>{item.totalPrice} TL</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.status === "Hazırlanıyor" ? COLORS.pending : COLORS.success },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {item.status === "Teslim Edildi" && (
        <TouchableOpacity style={styles.reorderButton}>
          <Ionicons name="refresh" size={16} color={COLORS.primary} />
          <Text style={styles.reorderButtonText}>Tekrar Sipariş Ver</Text>
        </TouchableOpacity>
      )}
    </View>
  );

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

      {/* İÇERİK (Siparişler Listesi veya Boş Durum) */}
      <View style={styles.content}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D7CCC8" />
            <Text style={styles.emptyTitle}>Henüz siparişiniz yok</Text>
            <Text style={styles.emptySubtitle}>
              Kahve kokusu burnunuza gelmedi mi? Hemen menüye göz atın!
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/menu")}>
              <Text style={styles.browseButtonText}>Menüyü İncele</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

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
        <NavItem icon="receipt" label="Siparişlerim" active={true} />
        <NavItem
          icon="person-outline"
          label="Profilim"
          onPress={() => router.push("/profile")}
          active={false}
        />
      </View>
    </SafeAreaView>
  );
}

// Navigasyon componenti: 'active' durumuna göre renk değiştiriyor
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
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 15,
    paddingBottom: 100, // Alt navigasyon barı üstüne binmesin diye
  },
  card: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primary,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  itemsText: {
    fontSize: 14,
    color: COLORS.textDark,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textDark,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
  reorderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    paddingVertical: 10,
    backgroundColor: "#F5E6E6",
    borderRadius: 8,
  },
  reorderButtonText: {
    marginLeft: 6,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    marginTop: 15,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  browseButtonText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 14,
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