import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
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
  error: "#D32F2F",
};

const categories = ["Kahveler", "Soğuk İçecekler", "Tatlılar", "Atıştırmalık"];

const products = [
  { id: "1", name: "Latte", price: 45 },
  { id: "2", name: "Americano", price: 40 },
  { id: "3", name: "Cappuccino", price: 50 },
];

export default function MenuScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState("Kahveler");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [cartCount, setCartCount] = useState(0);

  const [size, setSize] = useState("Medium");
  const [milk, setMilk] = useState("Whole");
  const [sugar, setSugar] = useState("None");
  const [quantity, setQuantity] = useState(1);

  const calculatePrice = () => {
    if (!selectedProduct) return 0;
    let base = selectedProduct.price;
    if (milk === "Oat") base += 5;
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
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="search-outline" size={22} color={COLORS.textDark} />

        <View style={{ alignItems: "center" }}>
          <Text style={styles.logo}>CAFE APP LOGO</Text>
          <Text style={styles.branch}>MERKEZ ŞUBE - MENÜ</Text>
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

      {/* PRODUCT LIST */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.imagePlaceholder} />

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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {selectedProduct?.name} Özelleştir
            </Text>

            {/* SIZE */}
            <Text style={styles.optionTitle}>Boyut</Text>
            {["Small", "Medium", "Large"].map((s) => (
              <TouchableOpacity key={s} onPress={() => setSize(s)}>
                <Text style={styles.optionItem}>
                  {size === s ? "● " : "○ "} {s}
                </Text>
              </TouchableOpacity>
            ))}

            {/* MILK */}
            <Text style={styles.optionTitle}>Süt Türü</Text>
            {["Whole", "Skim", "Oat"].map((m) => (
              <TouchableOpacity key={m} onPress={() => setMilk(m)}>
                <Text style={styles.optionItem}>
                  {milk === m ? "● " : "○ "} {m}
                </Text>
              </TouchableOpacity>
            ))}

            {/* SUGAR */}
            <Text style={styles.optionTitle}>Şeker</Text>
            {["None", "Medium", "Lots"].map((s) => (
              <TouchableOpacity key={s} onPress={() => setSugar(s)}>
                <Text style={styles.optionItem}>
                  {sugar === s ? "● " : "○ "} {s}
                </Text>
              </TouchableOpacity>
            ))}

            {/* QUANTITY */}
            <View style={styles.quantityRow}>
              <TouchableOpacity
                onPress={() => quantity > 1 && setQuantity(quantity - 1)}
              >
                <Ionicons name="remove-circle-outline" size={28} />
              </TouchableOpacity>

              <Text style={{ fontSize: 18 }}>{quantity}</Text>

              <TouchableOpacity onPress={() => setQuantity(quantity + 1)}>
                <Ionicons name="add-circle-outline" size={28} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cartButton} onPress={addToCart}>
              <Text style={styles.cartButtonText}>
                SEPETE EKLE - {calculatePrice()} TL
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNav}>
        <NavItem
          icon="home-outline"
          label="Ana Sayfa"
          onPress={() => router.push("/")}
        />
        <NavItem icon="restaurant-outline" label="Menü" />
        <NavItem
          icon="receipt-outline"
          label="Siparişlerim"
          onPress={() => router.push("/(tabs)/orders")}
        />
        <NavItem
          icon="person-outline"
          label="Profilim"
          onPress={() => router.push("/(tabs)")}
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
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: COLORS.inputBg,
  },

  logo: { fontSize: 16, fontWeight: "bold", color: COLORS.primary },
  branch: { fontSize: 12, color: COLORS.textLight },

  langButton: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badge: {
    position: "absolute",
    right: -6,
    top: -6,
    backgroundColor: COLORS.accent,
    borderRadius: 10,
    paddingHorizontal: 5,
  },

  badgeText: { fontSize: 10 },

  categoryBar: {
    paddingVertical: 10,
    paddingLeft: 10,
  },

  categoryItem: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.inputBg,
    marginRight: 10,
  },

  categoryActive: {
    backgroundColor: COLORS.primary,
  },

  categoryText: {
    color: COLORS.textDark,
    fontSize: 13,
  },

  productCard: {
    flexDirection: "row",
    backgroundColor: COLORS.inputBg,
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },

  imagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#DDD",
    marginRight: 15,
    borderRadius: 8,
  },

  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
  },

  productPrice: {
    color: COLORS.textLight,
    marginTop: 5,
  },

  addButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 10,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  optionTitle: {
    fontWeight: "600",
    marginTop: 10,
  },

  optionItem: {
    paddingVertical: 4,
  },

  quantityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },

  cartButton: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  cartButtonText: {
    color: COLORS.accent,
    fontWeight: "bold",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: COLORS.inputBg,
  },

  navItem: { alignItems: "center" },
  navText: { fontSize: 12, color: COLORS.primary },
});
