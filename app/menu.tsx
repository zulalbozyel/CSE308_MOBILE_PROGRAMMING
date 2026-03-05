import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";

import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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

// Şubelere özel menü veritabanı (Dinamik Yapı)
const allProducts: Record<string, any[]> = {
  "Merkez": [
    { id: "1", name: "Latte", price: 45 },
    { id: "2", name: "Americano", price: 40 },
    { id: "3", name: "Cappuccino", price: 50 },
  ],
  "Kadıköy": [
    { id: "4", name: "Buzlu Karamel Macchiato", price: 65 },
    { id: "5", name: "Cold Brew", price: 60 },
    { id: "6", name: "Çilekli Frappe", price: 70 },
  ],
};

export default function MenuScreen() {
  const router = useRouter();
  
  // Ana sayfadan gelen şube parametresini yakalıyoruz
  const { branchName } = useLocalSearchParams(); 
  
  // Eğer doğrudan alt menüden basılırsa (parametre yoksa) "Merkez" şubesini varsayılan yap
  const currentBranch = (branchName as string) || "Merkez";
  
  // O anki şubenin ürünlerini seçiyoruz (Şube listede yoksa Merkez'i gösterir)
  const currentProducts = allProducts[currentBranch] || allProducts["Merkez"];

  const [selectedCategory, setSelectedCategory] = useState("Kahveler");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);
  const touchY = useRef(0);
  const [size, setSize] = useState("Medium");
  const [milk, setMilk] = useState("Whole");
  const [sugar, setSugar] = useState("None");
  const [quantity, setQuantity] = useState(1);

  const calculatePrice = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    if (milk === "Oat") base += 5; // Yulaf sütü farkı
    if (size === "Large") base += 10; // Büyük boy farkı
    return base * quantity;
  };

  const openCustomization = (product: any) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const addToCart = () => {
    setCartCount(cartCount + quantity);
    setModalVisible(false);
    setQuantity(1);
    setSize("Medium");
    setMilk("Whole");
    setSugar("None");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="search-outline" size={22} color={COLORS.textDark} />

        <View style={{ alignItems: "center" }}>
          <Text style={styles.logo}>ROASTERY</Text>
          {/* Başlık dinamik olarak şube adını gösteriyor */}
          <Text style={styles.branch}>{currentBranch.toUpperCase()} ŞUBE - MENÜ</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={styles.langButton}>
            <Text style={{ fontSize: 12 }}>TR/EN</Text>
          </TouchableOpacity>

          <View style={{ marginLeft: 10 }}>
            <Ionicons name="cart-outline" size={24} color={COLORS.primary} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* CATEGORY BAR */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryBar}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryItem,
                selectedCategory === cat && styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === cat && { color: "white" },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* PRODUCT LIST */}
      <FlatList
        data={currentProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.imagePlaceholder}>
                <Ionicons name="cafe" size={30} color="#AAA" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>{item.price} TL</Text>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => openCustomization(item)}
            >
              <Ionicons name="add" size={22} color="white" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* CUSTOMIZATION MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        {/* Arkadaki karanlık alana tıklayınca da kapanması için TouchableOpacity yaptık */}
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={styles.modalContent}
            // Tıklamaların arka plana geçmesini engelliyoruz
            onStartShouldSetResponder={() => true}
            // AŞAĞI KAYDIRMA (SWIPE DOWN) MANTIĞI
            onTouchStart={(e) => touchY.current = e.nativeEvent.pageY}
            onTouchEnd={(e) => {
              if (e.nativeEvent.pageY - touchY.current > 50) { // 50 piksel aşağı kaydırılırsa
                setModalVisible(false);
              }
            }}
          >
            {/* KAYDIRMA ÇUBUĞU (DRAG HANDLE) GÖRSELİ */}
            <View style={styles.dragHandle} />

            <Text style={styles.modalTitle}>
              {selectedProduct?.name} Özelleştir
            </Text>

            {/* SIZE */}
            <Text style={styles.optionTitle}>Boyut</Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
                {["Small", "Medium", "Large"].map((s) => (
                <TouchableOpacity key={s} onPress={() => setSize(s)} style={{marginRight: 15}}>
                    <Text style={styles.optionItem}>
                    {size === s ? "● " : "○ "} {s}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            {/* MILK */}
            <Text style={styles.optionTitle}>Süt Türü</Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
                {["Whole", "Skim", "Oat"].map((m) => (
                <TouchableOpacity key={m} onPress={() => setMilk(m)} style={{marginRight: 15}}>
                    <Text style={styles.optionItem}>
                    {milk === m ? "● " : "○ "} {m}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            {/* SUGAR */}
            <Text style={styles.optionTitle}>Şeker</Text>
            <View style={{flexDirection: 'row', marginTop: 5}}>
                {["None", "Medium", "Lots"].map((s) => (
                <TouchableOpacity key={s} onPress={() => setSugar(s)} style={{marginRight: 15}}>
                    <Text style={styles.optionItem}>
                    {sugar === s ? "● " : "○ "} {s}
                    </Text>
                </TouchableOpacity>
                ))}
            </View>

            {/* QUANTITY */}
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Ionicons name="remove-circle-outline" size={32} color={COLORS.primary} />
              </TouchableOpacity>

              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{quantity}</Text>

              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <Ionicons name="add-circle-outline" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
              <Text style={styles.cartButtonText}>
                SEPETE EKLE - {calculatePrice()} TL
              </Text>
            </TouchableOpacity>
            
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="home-outline"
          label="Ana Sayfa"
          onPress={() => router.push("/home")}
        />
        <NavItem 
          icon="book" 
          label="Menü"
          active={true}
        />
        <NavItem
          icon="receipt-outline"
          label="Siparişlerim"
          onPress={() => router.push("/orders")}
        />
        <NavItem
          icon="person-outline"
          label="Profilim"
          onPress={() => router.push("/profile")}
        />
      </View>
    </SafeAreaView>
  );
}

const NavItem = ({ icon, label, onPress, active }: any) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={active ? 1 : 0.2}>
    <Ionicons name={icon} size={22} color={active ? COLORS.primary : COLORS.textLight} />
    <Text style={[styles.navText, { color: active ? COLORS.primary : COLORS.textLight, fontWeight: active ? "bold" : "normal" }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 15, backgroundColor: COLORS.inputBg, borderBottomWidth: 1, borderColor: '#EEE' },
  logo: { fontSize: 16, fontWeight: "900", color: COLORS.primary, letterSpacing: 1 },
  branch: { fontSize: 11, color: COLORS.textLight, marginTop: 2 },
  langButton: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderColor: '#CCC' },
  badge: { position: "absolute", right: -6, top: -6, backgroundColor: COLORS.accent, borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  badgeText: { fontSize: 10, fontWeight: 'bold' },
  categoryBar: { paddingVertical: 15, paddingLeft: 15 },
  categoryItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.inputBg, marginRight: 10, borderWidth: 1, borderColor: '#DDD' },
  categoryActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryText: { color: COLORS.textDark, fontSize: 13, fontWeight: '500' },
  productCard: { flexDirection: "row", backgroundColor: COLORS.inputBg, padding: 15, borderRadius: 12, marginBottom: 15, alignItems: "center", shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  imagePlaceholder: { width: 60, height: 60, backgroundColor: "#F0F0F0", marginRight: 15, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: "700", color: COLORS.textDark },
  productPrice: { color: COLORS.textLight, marginTop: 5, fontWeight: '500' },
  addButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 10 },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)" },
  modalContent: { backgroundColor: "white", padding: 25, borderTopLeftRadius: 25, borderTopRightRadius: 25 },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 15, color: COLORS.primary },
  optionTitle: { fontWeight: "700", marginTop: 15, fontSize: 15, color: COLORS.textDark },
  optionItem: { paddingVertical: 6, fontSize: 14, color: COLORS.textDark },
  quantityRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 25, paddingHorizontal: 20 },
  cartButton: { backgroundColor: COLORS.primary, padding: 16, borderRadius: 12, alignItems: "center", shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  cartButtonText: { color: COLORS.accent, fontWeight: "bold", fontSize: 16, letterSpacing: 1 },
  bottomNav: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 12, backgroundColor: COLORS.inputBg, borderTopWidth: 1, borderColor: '#EEE' },
  navItem: { alignItems: "center" },
  navText: { fontSize: 12, marginTop: 4 },
  
  // Eksik olan Drag Handle stilini buraya ekledim
  dragHandle: {
    width: 45,
    height: 5,
    backgroundColor: '#CCC',
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 15,
    marginTop: -5,
  },
});