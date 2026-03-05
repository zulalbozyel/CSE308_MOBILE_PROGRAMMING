import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
//kamera import
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Dimensions,
  Linking,
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
import MapView, { Marker } from "react-native-maps";

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

const branches = [
  {
    id: 1,
    name: "Merkez",
    distance: "0.8 km",
    status: "Açık",
    rating: 4,
    latitude: 37.8716,
    longitude: 32.4846,
  },
  {
    id: 2,
    name: "Kadıköy",
    distance: "3.2 km",
    status: "Kapalı",
    rating: 3,
    latitude: 37.874,
    longitude: 32.493,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [language, setLanguage] = useState("TR");

  const filteredBranches = onlyOpen
    ? branches.filter((b) => b.status === "Açık")
    : branches;
  // kamera ile ilgili stateler
  const [showScanner, setShowScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const handleBarcodeScanned = ({ type, data }: any) => {
    setScanned(true);
    alert(`QR İçerik: ${data}`);
    setShowScanner(false);
  };
// Harita uygulamasına yönlendirme fonksiyonu
  const openMap = (latitude: number, longitude: number, label: string) => {
    const url = Platform.select({
      ios: `maps:${latitude},${longitude}?q=${label}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    
    if (url) {
      Linking.openURL(url);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="search-outline" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ROASTERY</Text>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setLanguage(language === "TR" ? "EN" : "TR")}
        >
          <Text style={styles.languageText}>{language}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* MAP SECTION */}
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 37.8716,
              longitude: 32.4846,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
          >
            {filteredBranches.map((branch) => (
              <Marker
                key={branch.id}
                coordinate={{
                  latitude: branch.latitude,
                  longitude: branch.longitude,
                }}
                title={branch.name}
                description={branch.status}
              />
            ))}
          </MapView>
        </View>

        {/* FILTER */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterText}>Yalnızca Açık Şubeler</Text>
          <Switch
            value={onlyOpen}
            onValueChange={setOnlyOpen}
            trackColor={{ false: "#ccc", true: COLORS.accent }}
            thumbColor={onlyOpen ? COLORS.primary : "#fff"}
          />
        </View>

        {/* BRANCH LIST */}
        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            Yakındaki Şubeler ({filteredBranches.length})
          </Text>

          {filteredBranches.map((branch) => (
            <View key={branch.id} style={styles.card}>
              <View style={styles.cardRow}>
                <View>
                  <Text style={styles.branchName}>Şube Adı: {branch.name}</Text>
                  <Text style={styles.branchDetail}>
                    Mesafe: {branch.distance}
                  </Text>
                  <Text
                    style={[
                      styles.branchDetail,
                      {
                        color:
                          branch.status === "Açık" ? "green" : COLORS.error,
                      },
                    ]}
                  >
                    Durum: {branch.status}
                  </Text>
                  <Text style={styles.branchDetail}>
                    Puan: {"⭐".repeat(branch.rating)}
                  </Text>
                </View>
              </View>

              <View style={styles.cardButtons}>
                {/* HARİTADA GÖSTER BUTONU */}
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={() => openMap(branch.latitude, branch.longitude, branch.name)}
                >
                  <Text style={styles.secondaryButtonText}>
                    HARİTADA GÖSTER
                  </Text>
                </TouchableOpacity>

                {/* MENÜYÜ GÖR BUTONU */}
                <TouchableOpacity 
                  style={styles.secondaryButton}
onPress={() => router.push({ pathname: "/menu", params: { branchName: branch.name } })}
                >
                  <Text style={styles.secondaryButtonText}>MENÜYÜ GÖR</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.qrButton}
        onPress={async () => {
          if (!permission?.granted) {
            await requestPermission();
          }
          setScanned(false);
          setShowScanner(true);
        }}
      >
        <Ionicons name="qr-code-outline" size={26} color="#fff" />
      </TouchableOpacity>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/home")}
        >
          <Ionicons name="home" size={22} color={COLORS.primary} />
          <Text style={styles.navText}>Ana Sayfa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/menu")}
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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={22} color={COLORS.textLight} />
          <Text style={styles.navText}>Profilim</Text>
        </TouchableOpacity>
      </View>
      {showScanner && (
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />

          <TouchableOpacity
            style={styles.closeScanner}
            onPress={() => setShowScanner(false)}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>Kapat</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

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
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
    letterSpacing: 2,
  },
  languageButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  languageText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  mapContainer: {
    height: 250,
    width: width,
  },
  map: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textDark,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: COLORS.primary,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  branchName: {
    fontWeight: "700",
    fontSize: 16,
    color: COLORS.textDark,
  },
  branchDetail: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 3,
  },
  cardButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
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
    color: COLORS.textDark,
  },
  qrButton: {
    position: "absolute",
    right: 20,
    bottom: 80, // bottom nav'ın hemen üstü
    backgroundColor: COLORS.primary,
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  scannerContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "black",
    zIndex: 999,
  },

  closeScanner: {
    position: "absolute",
    bottom: 50,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
