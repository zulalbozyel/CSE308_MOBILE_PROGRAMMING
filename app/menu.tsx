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

const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  inputBg: "#FFFFFF",
  error: "#D32F2F",
};

const categories = ["Kahveler", "Soğuk İçecekler", "Tatlılar", "Atıştırmalık"];

// Şubelere özel zengin menü veritabanı (6'şar ürün)
const allProducts: Record<string, any[]> = {
  "Merkez": [
    { id: "1", name: "Latte", price: 65, category: "Kahveler", desc: "Taze espresso ve sıcak, ipeksi süt köpüğü" },
    { id: "2", name: "Americano", price: 55, category: "Kahveler", desc: "Sıcak su ile inceltilmiş yoğun espresso" },
    { id: "3", name: "Iced Caramel Macchiato", price: 85, category: "Soğuk İçecekler", desc: "Karamel, buz ve espressonun eşsiz uyumu" },
    { id: "4", name: "Cold Brew", price: 75, category: "Soğuk İçecekler", desc: "12 saat soğuk demlenmiş ferah kahve" },
    { id: "5", name: "San Sebastian", price: 110, category: "Tatlılar", desc: "İspanyol usulü, içi akışkan yanık cheesecake" },
    { id: "6", name: "Çikolatalı Cookie", price: 45, category: "Atıştırmalık", desc: "İçi bol Belçika çikolatalı nefis kurabiye" },
  ],
  "Kadıköy": [
    { id: "7", name: "Filtre Kahve", price: 45, category: "Kahveler", desc: "Günün taze demlenmiş yöresel kahvesi" },
    { id: "8", name: "Cappuccino", price: 65, category: "Kahveler", desc: "Bol ve kalın süt köpüklü klasik espresso" },
    { id: "9", name: "Çilekli Frappe", price: 90, category: "Soğuk İçecekler", desc: "Buzlu ve taze çilek püreli ferahlatıcı içecek" },
    { id: "10", name: "Iced Latte", price: 70, category: "Soğuk İçecekler", desc: "Buzlu süt ve taze espresso shot" },
    { id: "11", name: "Tiramisu", price: 120, category: "Tatlılar", desc: "Mascarpone peynirli ve kahveli İtalyan klasiği" },
    { id: "12", name: "Kruvasan", price: 50, category: "Atıştırmalık", desc: "Taptaze, tereyağlı çıtır kruvasan" },
  ],
};

export default function MenuScreen() {
  const router = useRouter();
  const { branchName } = useLocalSearchParams();

  // Aktif Şube State'i
  const [activeBranch, setActiveBranch] = useState((branchName as string) || "Merkez");
  const [branchModalVisible, setBranchModalVisible] = useState(false);

  // Arama ve Kategori
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Kahveler");

  // Ürünleri Filtreleme Mantığı
  const currentProducts = allProducts[activeBranch] || allProducts["Merkez"];
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
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const addToCart = () => {
    setCartCount(cartCount + quantity);
    setModalVisible(false);
    // Modal kapanınca ayarları sıfırla
    setQuantity(1);
    setSize("Medium");
    setMilk("Tam Yağlı");
    setSugar("Şekersiz");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        {/* Şube Seçici (Tıklanabilir) */}
        <TouchableOpacity style={styles.branchSelector} onPress={() => setBranchModalVisible(true)}>
          <Text style={styles.logo}>ROASTERY</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={styles.branch}>{activeBranch.toUpperCase()} ŞUBESİ</Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.primary} style={{ marginLeft: 4, marginTop: 2 }} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartIconContainer} onPress={() => router.push("/orders")}>
          <Ionicons name="cart-outline" size={26} color={COLORS.primary} />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
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
            {Object.keys(allProducts).map(branch => (
              <TouchableOpacity
                key={branch}
                style={[styles.branchOption, activeBranch === branch && styles.branchOptionActive]}
                onPress={() => {
                  setActiveBranch(branch);
                  setBranchModalVisible(false);
                }}
              >
                <Text style={[styles.branchOptionText, activeBranch === branch && { color: COLORS.primary, fontWeight: "bold" }]}>
                  {branch} Şubesi
                </Text>
                {activeBranch === branch && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
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

            <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
              <Text style={styles.cartButtonText}>
                Satın Al • {calculatePrice()} TL
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    backgroundColor: COLORS.background,
  },
  backButton: { padding: 5 },
  branchSelector: { alignItems: "center" },
  logo: { fontSize: 20, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
  branch: { fontSize: 13, color: COLORS.primary, marginTop: 2, fontWeight: "700" },
  cartIconContainer: { padding: 5, position: "relative" },
  badge: { position: "absolute", right: -2, top: -2, backgroundColor: COLORS.error, borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.background },
  badgeText: { fontSize: 10, fontWeight: 'bold', color: "#FFF" },

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