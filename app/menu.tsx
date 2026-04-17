import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  inputBg: "#FFFFFF",
  error: "#D32F2F",
  success: "#2E7D32",
};

const DEFAULT_CATEGORIES = ["Kahveler", "Soğuk İçecekler", "Tatlılar", "Atıştırmalık"];

// Statik ürün listesi kaldırıldı, veriler sadece API'den çekilecek
const allProducts: Record<string, any[]> = {};

export default function MenuScreen() {
  const router = useRouter();
  const { branchName, branchId, tableId, bypassQr } = useLocalSearchParams();
  const { session, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiProducts, setApiProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);

  // Aktif Şube State'i
  const [currentBranchId, setCurrentBranchId] = useState<string | null>((branchId as string) || null);
  const [activeBranch, setActiveBranch] = useState((branchName as string) || "Merkez");
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // Masa State'leri
  const [selectedTableId, setSelectedTableId] = useState<string | null>((tableId as string) || null);
  const [tables, setTables] = useState<any[]>([]);

  // Arama ve Kategori
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Kahveler");

  React.useEffect(() => {
    fetchProducts();
    fetchBranches();
  }, []);

  React.useEffect(() => {
    const manageSession = async () => {
      // Eğer parametre olarak hiçbir ID yoksa (yani Müşteri alt bardaki Menü tuşuna basıp sayfaya döndüyse)
      if (!tableId && !branchId) {
        const savedTableId = await AsyncStorage.getItem('lastTableId');
        const savedBranchId = await AsyncStorage.getItem('lastBranchId');
        const savedBranchName = await AsyncStorage.getItem('lastBranchName');
        
        if (savedTableId) setSelectedTableId(savedTableId);
        if (savedBranchId) setCurrentBranchId(savedBranchId);
        if (savedBranchName) setActiveBranch(savedBranchName);
      } else {
        // Eğer param olarak geldiyse (Kameradan taze taze QR okutulmuşsa), bunu cihaz hafızasına kaydet ki menüden çıkarsa da aklında kalsın
        if (tableId) await AsyncStorage.setItem('lastTableId', tableId as string);
        if (branchId) await AsyncStorage.setItem('lastBranchId', branchId as string);
        if (branchName) await AsyncStorage.setItem('lastBranchName', branchName as string);
      }
    };
    manageSession();
  }, [tableId, branchId]);

  React.useEffect(() => {
    if (currentBranchId) {
      fetchTables(currentBranchId);
    }
  }, [currentBranchId]);

  const fetchBranches = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      const response = await fetch(`${apiUrl}branches?isActive=true`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
      }
    } catch (e) {
      console.error("Branches error", e);
    }
  };

  const fetchTables = async (bId: string) => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      const response = await fetch(`${apiUrl}Tables?branchId=${bId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const rawData = await response.json();
        const dataArr = Array.isArray(rawData) ? rawData : (rawData.items || rawData.data || []);
        setTables(dataArr);

        // Sadece validasyonu kontrol et (Büyük-küçük harf eşleşme sorununa karşı toLowerCase)
        const realTable = selectedTableId ? dataArr.find((t: any) => String(t.id).toLowerCase() === String(selectedTableId).toLowerCase()) : null;

        if (!realTable) {
          // Geliştirici Ortamı İçin Bypass: Eğer home'dan Menü butonuna tıklandıysa testi hızlandırmak için ilk masayı otomatik ata
          if (bypassQr === "true" && dataArr.length > 0) {
            setSelectedTableId(dataArr[0].id);
          } else {
            setSelectedTableId(null);
          }
        } else {
          // Eşleşme varsa, state'i doğrudan API'nin geri döndüğü orijinal (küçük-büyük harfli) ID ile düzelt ki uyumsuzluk çıkmasın
          setSelectedTableId(realTable.id);
        }
      }
    } catch (e) {
      console.error("Tables error", e);
    }
  };

  const fetchProducts = async () => {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";
      const options: any = {
        headers: { 'Content-Type': 'application/json' }
      };

      if (session?.access_token) {
        options.headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      console.log("Fetching products from:", `${apiUrl}products?isAvailable=true`);
      const response = await fetch(`${apiUrl}products?isAvailable=true`, options);
      if (response.ok) {
        const data = await response.json();
        setApiProducts(data);
        const uniqueCats = Array.from(new Set(data.map((item: any) => item.categoryName))).filter(Boolean) as string[];
        if (uniqueCats.length > 0) {
          setCategories(uniqueCats);
          setSelectedCategory(uniqueCats[0]);
        }
      }
    } catch (e) {
      console.error("Products error", e);
    }
  };

  // Ürünleri Filtreleme Mantığı
  const currentProducts = apiProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: typeof p.price === 'number' ? p.price : parseFloat(p.price) || 0,
    category: p.categoryName || "Genel",
    desc: p.description || ""
  }));

  const filteredProducts = currentProducts.filter(p => {
    if (searchQuery.length > 0) {
      // Arama yapılıyorsa kategoriyi boşver, isme göre ara
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    // Arama yoksa seçili kategoriye göre getir
    return p.category === selectedCategory;
  });

  // Özelleştirme ve Sepet State'leri
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const touchY = useRef(0);

  const [size, setSize] = useState("Medium");
  const [milk, setMilk] = useState("Tam Yağlı");
  const [sugar, setSugar] = useState("Şekersiz");
  const [quantity, setQuantity] = useState(1);

  const calculatePrice = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    if (milk === "Yulaf" || milk === "Badem") base += 15; // Bitkisel süt farkı
    if (size === "Large") base += 15; // Büyük boy farkı
    return base * quantity;
  };

  const openCustomization = (product: any) => {
    if (!selectedTableId) {
      alert("Lütfen sipariş vermek için masanızdaki QR kodu okutun.");
      return;
    }
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const addToCart = async () => {
    if (!selectedProduct) return;
    const price = calculatePrice();
    setIsProcessing(true);

    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || "https://cafemanagementapi.baksoftarge.com/api/";

      const orderBody: any = {
        branchId: currentBranchId, 
        tableId: selectedTableId,
        customerId: user?.id || null,
        items: [
          {
            productId: selectedProduct.id,
            quantity: quantity,
            notes: `${size}, ${milk}, ${sugar}`
          }
        ]
      };

      if (!orderBody.branchId || !orderBody.tableId) {
        alert("Eksik Bilgi: Lütfen geçerli bir şube ve masa üzerinden sipariş verin. (Masa bulunamadı)");
        setIsProcessing(false);
        return;
      }

      // Eğer elimizde bir tableId varsa ekle (Şu an opsiyonel tutuyoruz)
      // orderBody.tableId = "UUID_HERE";

      console.log("Sending Order Body:", JSON.stringify(orderBody, null, 2));

      const options: any = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderBody)
      };

      if (session?.access_token) {
        options.headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const orderResponse = await fetch(`${apiUrl}orders`, options);

      let parsedOrderId = null;
      if (orderResponse.ok) {
        try {
          const orderResText = await orderResponse.text();
          // Response text could be raw UUID or JSON
          try {
            const orderResJson = JSON.parse(orderResText);
            parsedOrderId = orderResJson.id || orderResText;
          } catch {
            parsedOrderId = orderResText;
          }
        } catch { }
      } else {
        const errorText = await orderResponse.text();
        console.warn("API Order Create Error:", errorText);
        try {
          const errJSON = JSON.parse(errorText);
          alert(`Sipariş Oluşturulamadı: ${errJSON.Message || errorText}`);
        } catch {
          alert(`Sipariş Oluşturulamadı: ${errorText}`);
        }
        setIsProcessing(false);
        return;
      }

      // 2. WALLET DEDUCTION
      const response = await fetch(`${apiUrl}wallet/spend-coins`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: price, orderId: parsedOrderId || null }),
      });

      if (response.ok) {
        alert(`Siparişiniz başarıyla alındı! Cüzdanınızdan tutar düşüldü. ☕`);
        setCartCount(cartCount + quantity);
        setModalVisible(false);
        // Modal kapanınca ayarları sıfırla
        setQuantity(1);
        setSize("Medium");
        setMilk("Tam Yağlı");
        setSugar("Şekersiz");
      } else {
        const walletError = await response.text();
        try {
          const wJson = JSON.parse(walletError);
          alert(`Yetersiz Bakiye veya Ödeme Hatası: ${wJson.Message || walletError}`);
        } catch {
          alert(`Ödeme Hatası: ${walletError}`);
        }
      }
    } catch (error: any) {
      alert(`Sipariş işlemi başarısız: ${error.message || "Bilinmeyen hata"}`);
      console.error("Sipariş ödemesi alınırken hata oluştu:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity onPress={() => setBranchModalVisible(true)} style={styles.branchSelector}>
            <Text style={styles.headerTitle}>{activeBranch}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={[styles.tableSelector, { backgroundColor: selectedTableId ? COLORS.success : COLORS.error }]}>
            <Text style={[styles.tableText, { color: '#FFF' }]}>
              {selectedTableId 
                ? `Masa Numarası : ${tables.find(t => String(t.id).toLowerCase() === String(selectedTableId).toLowerCase())?.number || tables.find(t => String(t.id).toLowerCase() === String(selectedTableId).toLowerCase())?.name || ""}` 
                : "Lütfen Masadaki QR Kodu Okutun"}
            </Text>
            {!selectedTableId && <Ionicons name="qr-code-outline" size={14} color="#FFF" style={{ marginLeft: 6 }} />}
          </View>
        </View>
        <TouchableOpacity style={styles.cartBtn}>
          <Ionicons name="search-outline" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
      </View>
      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Kahve, tatlı veya atıştırmalık ara..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORY BAR (Sadece arama yapılmıyorsa göster) */}
      {searchQuery.length === 0 && (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryItem, selectedCategory === cat && styles.categoryActive]}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && { color: "white" }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* PRODUCT LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={{ alignItems: "center", marginTop: 50 }}>
            <Ionicons name="cafe-outline" size={50} color="#DDD" />
            <Text style={{ color: COLORS.textLight, marginTop: 15 }}>Ürün bulunamadı.</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.productCard} onPress={() => openCustomization(item)} activeOpacity={0.8}>
            <View style={styles.imagePlaceholder}>
              <Ionicons name={item.category === "Tatlılar" || item.category === "Atıştırmalık" ? "restaurant" : "cafe"} size={36} color="#BCAAA4" />
            </View>

            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productDesc} numberOfLines={2}>{item.desc}</Text>
              <Text style={styles.productPrice}>{item.price} TL</Text>
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => openCustomization(item)}>
              <Ionicons name="add" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      {/* ŞUBE SEÇİM MODALI */}
      <Modal visible={branchModalVisible} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setBranchModalVisible(false)}>
          <View style={styles.branchModalContent}>
            <Text style={styles.branchModalTitle}>Şube Seçin</Text>
            {branches.map(branch => (
              <TouchableOpacity
                key={branch.id}
                style={[styles.branchOption, currentBranchId === branch.id && styles.branchOptionActive]}
                onPress={() => {
                  setCurrentBranchId(branch.id);
                  setActiveBranch(branch.name);
                  setBranchModalVisible(false);
                }}
              >
                <Text style={[styles.branchOptionText, currentBranchId === branch.id && { color: COLORS.primary, fontWeight: "bold" }]}>
                  {branch.name}
                </Text>
                {currentBranchId === branch.id && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* CUSTOMIZATION MODAL (Özelleştirme ve Sepete Ekle) */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchStart={(e) => touchY.current = e.nativeEvent.pageY}
            onTouchEnd={(e) => {
              if (e.nativeEvent.pageY - touchY.current > 50) setModalVisible(false);
            }}
          >
            <View style={styles.dragHandle} />

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
              <Text style={styles.modalTitle}>{selectedProduct?.name}</Text>
              <Text style={styles.modalPrice}>{selectedProduct?.price} TL</Text>
            </View>
            <Text style={{ color: COLORS.textLight, marginBottom: 20 }}>{selectedProduct?.desc}</Text>

            {/* Sadece içecekler için süt/boyut gösterimi */}
            {(selectedProduct?.category === "Kahveler" || selectedProduct?.category === "Soğuk İçecekler") && (
              <>
                {/* SIZE PILLS */}
                <Text style={styles.optionTitle}>Boyut</Text>
                <View style={styles.pillContainer}>
                  {["Small", "Medium", "Large"].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setSize(s)} style={[styles.pill, size === s && styles.pillActive]}>
                      <Text style={[styles.pillText, size === s && styles.pillTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* MILK PILLS */}
                <Text style={styles.optionTitle}>Süt Seçimi</Text>
                <View style={styles.pillContainer}>
                  {["Tam Yağlı", "Yağsız", "Yulaf", "Badem"].map((m) => (
                    <TouchableOpacity key={m} onPress={() => setMilk(m)} style={[styles.pill, milk === m && styles.pillActive]}>
                      <Text style={[styles.pillText, milk === m && styles.pillTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* SUGAR PILLS */}
                <Text style={styles.optionTitle}>Şeker</Text>
                <View style={styles.pillContainer}>
                  {["Şekersiz", "Az", "Orta", "Çok"].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setSugar(s)} style={[styles.pill, sugar === s && styles.pillActive]}>
                      <Text style={[styles.pillText, sugar === s && styles.pillTextActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {/* QUANTITY */}
            <View style={styles.quantityContainer}>
              <Text style={styles.optionTitle}>Adet</Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity onPress={() => quantity > 1 && setQuantity(quantity - 1)} style={styles.qBtn}>
                  <Ionicons name="remove" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qBtn}>
                  <Ionicons name="add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.cartButton, isProcessing && { opacity: 0.7 }]} onPress={addToCart} disabled={isProcessing}>
              <Text style={styles.cartButtonText}>
                {isProcessing ? "İşleniyor..." : `Satın Al • ${calculatePrice()} TL`}
              </Text>
            </TouchableOpacity>

          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem icon="home-outline" label="Ana Sayfa" onPress={() => router.push("/home")} active={false} />
        <NavItem icon="book" label="Menü" onPress={() => { }} active={true} />
        <NavItem icon="receipt-outline" label="Siparişler" onPress={() => router.push("/orders")} active={false} />
        <NavItem icon="person-outline" label="Profil" onPress={() => router.push("/profile")} active={false} />
      </View>
    </SafeAreaView>
  );
}

const NavItem = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Ionicons name={icon} size={22} color={active ? COLORS.primary : COLORS.textLight} />
    <Text style={[styles.navText, { color: active ? COLORS.primary : COLORS.textLight, fontWeight: active ? "bold" : "normal" }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerTitleContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Outfit-Bold',
    color: COLORS.textDark,
  },
  backBtn: {
    padding: 8,
  },
  cartBtn: {
    padding: 8,
  },
  branchSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tableSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 2,
  },
  tableText: {
    fontSize: 12,
    fontFamily: 'Outfit-Medium',
    color: COLORS.primary,
  },
  branchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  branchItemText: {
    fontSize: 16,
    fontFamily: 'Outfit-Medium',
    color: COLORS.textDark,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
  },
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    backgroundColor: COLORS.background,
  },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.inputBg, marginHorizontal: 20, borderRadius: 12, paddingHorizontal: 15, height: 50, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginBottom: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.textDark },

  categoryBar: { paddingVertical: 5, paddingLeft: 20, marginBottom: 10 },
  categoryItem: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: COLORS.inputBg, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  categoryActive: { backgroundColor: COLORS.primary },
  categoryText: { color: COLORS.textDark, fontSize: 14, fontWeight: '600' },

  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  productCard: { flexDirection: "row", backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 16, marginBottom: 15, alignItems: "center", shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  imagePlaceholder: { width: 70, height: 70, backgroundColor: "#EFEBE9", marginRight: 15, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  productInfo: { flex: 1, justifyContent: "center" },
  productName: { fontSize: 16, fontWeight: "800", color: COLORS.textDark, marginBottom: 4 },
  productDesc: { fontSize: 12, color: COLORS.textLight, marginBottom: 8, lineHeight: 16 },
  productPrice: { fontSize: 15, fontWeight: "800", color: COLORS.primary },
  addButton: { backgroundColor: "#F5E6E6", padding: 10, borderRadius: 12, marginLeft: 10 },

  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  branchModalContent: { backgroundColor: "white", padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  branchModalTitle: { fontSize: 18, fontWeight: "800", color: COLORS.textDark, marginBottom: 20, textAlign: "center" },
  branchOption: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  branchOptionActive: { backgroundColor: "#F5F5F5", borderRadius: 10, paddingHorizontal: 10, borderBottomWidth: 0 },
  branchOptionText: { fontSize: 16, color: COLORS.textDark },

  modalContent: { backgroundColor: "white", padding: 25, borderTopLeftRadius: 30, borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  dragHandle: { width: 45, height: 5, backgroundColor: '#DDD', borderRadius: 5, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: "900", color: COLORS.primary },
  modalPrice: { fontSize: 20, fontWeight: "800", color: COLORS.accent },

  optionTitle: { fontWeight: "800", marginTop: 15, marginBottom: 10, fontSize: 15, color: COLORS.textDark },
  pillContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.background, borderWidth: 1, borderColor: "#DDD" },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: 14, color: COLORS.textDark, fontWeight: "600" },
  pillTextActive: { color: COLORS.accent },

  quantityContainer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 20, marginBottom: 30 },
  quantityRow: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.background, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  qBtn: { padding: 5 },
  quantityText: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginHorizontal: 20 },

  cartButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 16, alignItems: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  cartButtonText: { color: COLORS.accent, fontWeight: "800", fontSize: 16, letterSpacing: 1 },

  bottomNav: { position: "absolute", bottom: 0, width: "100%", flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.inputBg, borderTopWidth: 1, borderColor: '#EEE' },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4 },
});