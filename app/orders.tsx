import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  FlatList,
  Platform,
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
  blue: "#1976D2",
  error: "#D32F2F",
};

export default function OrdersScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("Aktif"); // "Aktif" veya "Gecmis"
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      console.log("Fetching orders from:", `${apiUrl}orders/me`);
      
      const options: any = {
        headers: { 'Content-Type': 'application/json' }
      };
      if (session?.access_token) {
        options.headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`${apiUrl}orders/me`, options);
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : (data.items || []));
      }
    } catch (error) {
      console.error("Siparişler çekilemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      const response = await fetch(`${apiUrl}orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        alert("Siparişiniz başarıyla iptal edildi.");
        fetchOrders(); // Listeyi yenile
      } else {
        alert("Sipariş iptal edilemedi.");
      }
    } catch (error) {
      console.error("İptal işlemi başarısız:", error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // 0 = Beklemede/Hazırlanıyor, 1 = Tamamlandı, 2 = İptal
    const isCompletedOrCancelled = order.status === 1 || order.status === 2 || order.status === "İptal Edildi" || order.status === "Teslim Edildi" || order.status === "Completed" || order.status === "Cancelled";
    if (activeTab === "Aktif") return !isCompletedOrCancelled;
    return isCompletedOrCancelled;
  });

  const renderOrderItem = ({ item }: { item: any }) => {
    const isCompleted = item.status === 1 || item.status === "Teslim Edildi" || item.status === "Completed";
    const isCancelled = item.status === 2 || item.status === "İptal Edildi" || item.status === "İptal" || item.status === "Cancelled";
    const isPending = !isCompleted && !isCancelled;
    
    const displayStatus = isCancelled ? "İptal Edildi" : (isCompleted ? "Tamamlandı" : "Hazırlanıyor");
    const statusColor = isCancelled ? COLORS.error : (isCompleted ? COLORS.success : COLORS.pending);
    
    // Güvenli ID gösterimi ve tarih
    const safeId = item.id ? String(item.id).substring(0, 8) : "---";
    const safeDate = item.createdAt || item.orderDate ? new Date(item.createdAt || item.orderDate).toLocaleDateString() : "Bugün";
    const extractItems = () => {
      if (item.itemsText) return item.itemsText;
      
      const arr = item.items || item.orderItems || item.orderLines || item.products || item.details;
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.map((i:any) => `${i.quantity||1}x ${i.productName || i.name || i.notes || "Ürün"}`).join(", ");
      }
      if (item.notes) return item.notes;
      // Tüm çabalara rağmen liste çıkartılamazsa kullanıcının istediği sade özeti göster:
      const pText = typeof item.products === 'object' ? JSON.stringify(item.products) : (item.products || "-");
      return `Masa: ${item.tableNumber || "?"} • Durum: ${item.status} \nÜrünler: ${pText}`;
    };
    const safeItems = extractItems();

    return (
      <View style={styles.card}>
        {/* KART BAŞLIĞI */}
        <View style={styles.cardHeader}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={styles.iconBox}>
               <Ionicons name="cafe" size={20} color={COLORS.primary} />
            </View>
            <View>
              <Text style={styles.orderId}>Sipariş #{safeId}</Text>
              <Text style={styles.orderDate}>{safeDate} • {item.branchName || "Şube"}</Text>
            </View>
          </View>
          
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{displayStatus}</Text>
          </View>
        </View>

        {/* İÇERİK BİLGİSİ */}
        <View style={styles.itemsContainer}>
          <Text style={styles.itemsText}>{safeItems}</Text>
        </View>

        {/* KART ALTI (Fiyat ve Buton) */}
        <View style={styles.cardFooter}>
          <Text style={styles.totalPrice}>{item.totalPrice || item.totalAmount || item.amount || 0} TL</Text>
          
          {!isPending ? (
            <TouchableOpacity style={styles.reorderButton} onPress={() => router.push("/menu")}>
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.reorderButtonText}>Yeni Sipariş</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.reorderButton, { backgroundColor: COLORS.error }]} onPress={() => cancelOrder(item.id)}>
              <Ionicons name="close" size={16} color="#FFF" />
              <Text style={styles.reorderButtonText}>Siparişi İptal Et</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Siparişlerim</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => router.push("/menu")}>
            <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* TAB MENÜSÜ */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "Aktif" && styles.tabActive]}
          onPress={() => setActiveTab("Aktif")}
        >
          <Text style={[styles.tabText, activeTab === "Aktif" && styles.tabTextActive]}>Aktif Siparişler</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === "Gecmis" && styles.tabActive]}
          onPress={() => setActiveTab("Gecmis")}
        >
          <Text style={[styles.tabText, activeTab === "Gecmis" && styles.tabTextActive]}>Geçmiş Siparişler</Text>
        </TouchableOpacity>
      </View>

      {/* İÇERİK LİSTESİ */}
      <View style={styles.content}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D7CCC8" />
            <Text style={styles.emptyTitle}>Sipariş bulunamadı</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === "Aktif" ? "Şu an hazırlanan bir siparişin yok. Bir kahve iyi giderdi!" : "Henüz hiç sipariş vermemişsin. Menüye göz at!"}
            </Text>
            <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/menu")}>
              <Text style={styles.browseButtonText}>Sipariş Ver</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item.id}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem icon="home-outline" label="Ana Sayfa" onPress={() => router.push("/home")} active={false} />
        <NavItem icon="restaurant-outline" label="Menü" onPress={() => router.push("/menu")} active={false} />
        <NavItem icon="receipt" label="Siparişler" active={true} />
        <NavItem icon="person-outline" label="Profil" onPress={() => router.push("/profile")} active={false} />
      </View>
    </SafeAreaView>
  );
}

// Navigasyon Componenti
const NavItem = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={active ? COLORS.accent : COLORS.textLight} />
    <Text style={[styles.navText, { color: active ? COLORS.primary : COLORS.textLight, fontWeight: active ? "700" : "400" }]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    padding: 20, 
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    backgroundColor: COLORS.background 
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: COLORS.primary, letterSpacing: 0.5 },
  cartBtn: { backgroundColor: COLORS.inputBg, padding: 8, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  
  tabContainer: { flexDirection: "row", marginHorizontal: 20, marginBottom: 15, backgroundColor: COLORS.inputBg, borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  tabTextActive: { color: COLORS.accent, fontWeight: "800" },

  content: { flex: 1 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  
  card: { backgroundColor: COLORS.inputBg, borderRadius: 16, padding: 18, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#F5E6E6", justifyContent: "center", alignItems: "center", marginRight: 12 },
  orderId: { fontSize: 15, fontWeight: "800", color: COLORS.textDark, marginBottom: 2 },
  orderDate: { fontSize: 12, color: COLORS.textLight, fontWeight: "500" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
  
  itemsContainer: { backgroundColor: "#F9F9F9", padding: 12, borderRadius: 10, marginBottom: 15 },
  itemsText: { fontSize: 14, color: COLORS.textDark, lineHeight: 22, fontWeight: "500" },
  
  favoriteBadge: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  favoriteText: { marginLeft: 6, fontSize: 12, color: COLORS.primary, fontWeight: "700" },

  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#EEE", paddingTop: 15 },
  totalPrice: { fontSize: 18, fontWeight: "900", color: COLORS.primary },
  
  reorderButton: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  reorderButtonText: { color: COLORS.accent, fontWeight: "800", fontSize: 13, marginLeft: 6 },
  
  trackButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5E6E6", paddingVertical: 10, paddingHorizontal: 15, borderRadius: 10 },
  trackButtonText: { color: COLORS.primary, fontWeight: "800", fontSize: 13, marginLeft: 6 },

  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30, marginTop: 40 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textDark, marginTop: 15, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textLight, textAlign: "center", marginBottom: 25, lineHeight: 20 },
  browseButton: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 30, borderRadius: 12, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  browseButtonText: { color: COLORS.accent, fontWeight: "800", fontSize: 15 },
  
  bottomNav: { position: "absolute", bottom: 0, width: "100%", flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.inputBg, borderTopWidth: 1, borderColor: "#EEE" },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4 },
});