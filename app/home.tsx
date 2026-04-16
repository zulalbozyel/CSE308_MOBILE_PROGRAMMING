import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  inputBg: "#FFFFFF",
  error: "#D32F2F",
};

// --- MOCK DATALAR (Sunum için) ---
const SUGGESTIONS = [
  { id: 1, name: "Iced Latte", price: "45 TL", icon: "cafe-outline" },
  { id: 2, name: "Brownie", price: "55 TL", icon: "pizza-outline" },
  { id: 3, name: "Cold Brew", price: "60 TL", icon: "snow-outline" },
];

const CAMPAIGNS = [
  { id: 1, title: "Sadakat Puanlarınla Bedava Kahveni Al!", subtitle: "Hemen kullan", bg: COLORS.primary, textColor: "#FFF" },
  { id: 2, title: "Yeni Etiyopya Çekirdekleri Geldi", subtitle: "Menüden incele", bg: COLORS.accent, textColor: COLORS.primary },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, session } = useAuth();

  const userName = user?.user_metadata?.full_name?.split(" ")[0] || "Kullanıcı";

  // Branch State
  const [branches, setBranches] = useState<any[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, [session]);

  const fetchBranches = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      const response = await fetch(`${apiUrl}branches?isActive=true`, {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      } else {
        console.error("API Hatası:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Kamera State'leri
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false); // Flaş (Torch) durumu

  const handleBarcodeScanned = ({ type, data }: any) => {
    setScanned(true);
    alert(`QR İçerik: ${data}`);
    setShowScanner(false);
    setTorch(false); // Tarama bitince flaşı kapat
  };

  const openMap = (latitude: number, longitude: number, label: string) => {
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${label}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    if (url) Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>Günaydın, {userName}! ☕</Text>
          <Text style={styles.brandTitle}>ROASTERY</Text>
        </View>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.primary} />
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* EN ÜST: COMPACT MAP & BRANCHES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yakındaki Şubeler</Text>

          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: 36.8987, // Antalya Center (Teknokent)
                longitude: 30.6454,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              }}
            >
              {branches.map((branch) => (
                branch.latitude && branch.longitude && (
                  <Marker
                    key={branch.id}
                    coordinate={{ latitude: branch.latitude, longitude: branch.longitude }}
                    title={branch.name}
                  />
                )
              ))}
            </MapView>
          </View>

          {/* Şube Kartları & Menü Butonu */}
          {branches.map((branch) => (
            <View key={branch.id} style={styles.compactBranchCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.branchName}>{branch.name}</Text>
                <Text style={styles.branchDist}>
                  {branch.address} • <Text style={{ color: branch.isActive ? 'green' : 'red' }}>{branch.isActive ? 'Açık' : 'Kapalı'}</Text>
                </Text>
              </View>

              <View style={styles.branchActions}>
                <TouchableOpacity
                  style={styles.menuBtn}
                  onPress={() => router.push({ pathname: "/menu", params: { branchId: branch.id, branchName: branch.name } })}
                >
                  <Text style={styles.menuBtnText}>Menü</Text>
                </TouchableOpacity>

                {branch.latitude && branch.longitude && (
                  <TouchableOpacity
                    style={styles.goBtn}
                    onPress={() => openMap(branch.latitude, branch.longitude, branch.name)}
                  >
                    <Ionicons name="navigate" size={18} color="#FFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* WALLET & LOYALTY CARD */}
        < View style={styles.walletCard} >
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Cüzdan Bakiyesi</Text>
              <Text style={styles.walletAmount}>120.50 TL</Text>
            </View>
          </View>
          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.actionBtnText}>TL Yükle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnDark} onPress={() => router.push("/profile")}>
              <Ionicons name="qr-code-outline" size={20} color={COLORS.accent} />
              <Text style={styles.actionBtnTextLight}>QR Göster</Text>
            </TouchableOpacity>
          </View>
        </View >

        {/* SUGGESTIONS */}
        < View style={styles.section} >
          <Text style={styles.sectionTitle}>Bunları denedin mi?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {SUGGESTIONS.map((item) => (
              <TouchableOpacity key={item.id} style={styles.suggestionCard} onPress={() => router.push("/menu")}>
                <View style={styles.iconBox}>
                  <Ionicons name={item.icon as any} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.suggestionName}>{item.name}</Text>
                <Text style={styles.suggestionPrice}>{item.price}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View >

        {/* ANNOUNCEMENTS */}
        < View style={styles.section} >
          <Text style={styles.sectionTitle}>Duyurular & Fırsatlar</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {CAMPAIGNS.map((camp) => (
              <TouchableOpacity key={camp.id} style={[styles.campaignCard, { backgroundColor: camp.bg }]}>
                <Text style={[styles.campaignTitle, { color: camp.textColor }]}>{camp.title}</Text>
                <Text style={[styles.campaignSubtitle, { color: camp.textColor, opacity: 0.8 }]}>{camp.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View >

      </ScrollView >

      {/* FAB - QR SCANNER */}
      < TouchableOpacity
        style={styles.qrButton}
        onPress={async () => {
          if (!permission?.granted) await requestPermission();
          setScanned(false);
          setTorch(false);
          setShowScanner(true);
        }}
      >
        <Ionicons name="scan" size={26} color={COLORS.primary} />
      </TouchableOpacity >

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem icon="home" label="Ana Sayfa" onPress={() => { }} active={true} />
        <NavItem icon="restaurant-outline" label="Menü" onPress={() => router.push("/menu")} active={false} />
        <NavItem icon="receipt-outline" label="Siparişler" onPress={() => router.push("/orders")} active={false} />
        <NavItem icon="person-outline" label="Profil" onPress={() => router.push("/profile")} active={false} />
      </View >

      {/* 🚀 MODERN QR SCANNER OVERLAY */}
      {showScanner && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            enableTorch={torch} // Flaş kontrolü
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          >
            {/* Karartılmış Arka Plan */}
            <View style={styles.layerTop} />
            <View style={styles.layerCenter}>
              <View style={styles.layerLeft} />

              {/* Odak Izgarası (Viewfinder) */}
              <View style={styles.focusedArea}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>

              <View style={styles.layerRight} />
            </View>
            <View style={styles.layerBottom}>
              <Text style={styles.scanText}>Puan kazanmak için QR kodu okutun</Text>

              {/* Kamera Kontrol Butonları */}
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setTorch(!torch)}
                >
                  <Ionicons name={torch ? "flash" : "flash-off"} size={28} color="#FFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.closeScannerModern}
                  onPress={() => {
                    setShowScanner(false);
                    setTorch(false);
                  }}
                >
                  <Ionicons name="close" size={32} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        </View>
      )}
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
    paddingTop: Platform.OS === 'android' ? 45 : 10
  },
  greetingText: { fontSize: 14, color: COLORS.textLight, marginBottom: 4 },
  brandTitle: { fontSize: 22, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
  notificationBtn: { padding: 8, backgroundColor: COLORS.inputBg, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  badge: { position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error },

  walletCard: { backgroundColor: COLORS.primary, marginHorizontal: 20, borderRadius: 20, padding: 20, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6, marginBottom: 25 },
  walletRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  walletLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 4 },
  walletAmount: { color: COLORS.accent, fontSize: 26, fontWeight: "900" },
  walletActions: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  actionBtn: { flex: 1, flexDirection: "row", backgroundColor: COLORS.accent, paddingVertical: 10, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  actionBtnText: { color: COLORS.primary, fontWeight: "700", marginLeft: 6, fontSize: 13 },
  actionBtnDark: { flex: 1, flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", paddingVertical: 10, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  actionBtnTextLight: { color: "#FFF", fontWeight: "700", marginLeft: 6, fontSize: 13 },

  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark, marginHorizontal: 20, marginBottom: 15 },
  horizontalScroll: { paddingLeft: 20 },

  suggestionCard: { backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 16, marginRight: 15, width: 120, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  iconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#F5E6E6", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  suggestionName: { fontSize: 14, fontWeight: "600", color: COLORS.textDark, textAlign: "center", marginBottom: 4 },
  suggestionPrice: { fontSize: 13, color: COLORS.textLight, fontWeight: "500" },

  campaignCard: { width: width * 0.75, padding: 20, borderRadius: 20, marginRight: 15, justifyContent: "center" },
  campaignTitle: { fontSize: 18, fontWeight: "800", marginBottom: 5 },
  campaignSubtitle: { fontSize: 13, fontWeight: "500" },

  mapContainer: { height: 160, marginHorizontal: 20, borderRadius: 16, overflow: "hidden", marginBottom: 15 },
  map: { flex: 1 },
  compactBranchCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.inputBg, marginHorizontal: 20, padding: 15, borderRadius: 12, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  branchName: { fontSize: 15, fontWeight: "700", color: COLORS.textDark, marginBottom: 4 },
  branchDist: { fontSize: 13, color: COLORS.textLight },

  branchActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  menuBtn: { backgroundColor: COLORS.accent, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  menuBtnText: { color: COLORS.primary, fontWeight: "700", fontSize: 12 },
  goBtn: { backgroundColor: COLORS.primary, width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },

  qrButton: { position: "absolute", right: 20, bottom: 90, backgroundColor: COLORS.accent, width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: COLORS.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },

  bottomNav: { position: "absolute", bottom: 0, width: "100%", flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.inputBg, borderTopWidth: 1, borderColor: "#EEE" },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4 },

  // --- MODERN QR SCANNER STYLES ---
  scannerContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: "black", zIndex: 999 },
  layerTop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  layerCenter: { flexDirection: "row" },
  layerLeft: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  focusedArea: { width: 250, height: 250, backgroundColor: "transparent" },
  layerRight: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  layerBottom: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", paddingTop: 30 },

  // Viewfinder (Odak Izgarası Köşeleri)
  corner: { position: "absolute", width: 40, height: 40, borderColor: COLORS.accent },
  topLeft: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 20 },

  scanText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginBottom: 40 },

  cameraControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: 250 },
  iconButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  closeScannerModern: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.error, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
});