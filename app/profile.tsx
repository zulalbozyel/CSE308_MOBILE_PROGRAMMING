import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

const COLORS = {
  primary: "#3E2723",
  background: "#F5F5F5",
  accent: "#FFC107",
  textDark: "#212121",
  textLight: "#757575",
  card: "#FFFFFF",
  inputBg: "#FFFFFF",
};
export default function Profile() {
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);

  // Edit Profile States
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [newName, setNewName] = useState(user?.user_metadata?.full_name || "");
  const [newAvatar, setNewAvatar] = useState(user?.user_metadata?.avatar_url || "");

  // Password States
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = async () => {
    if (!newName.trim()) {
      Alert.alert("Hata", "Lütfen geçerli bir isim giriniz.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName, avatar_url: newAvatar }
      });

      if (error) throw error;

      Alert.alert("Başarılı", "Profil bilgileriniz güncellendi.");
      setProfileModalVisible(false);
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Hata", "Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      Alert.alert("Başarılı", "Şifreniz başarıyla değiştirildi.");
      setPasswordModalVisible(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Hata", error.message || "Bir sorun oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraflarınıza erişmek için izin vermeniz gerekiyor.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Modern API
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      const selectedUri = result.assets[0].uri;
      uploadImage(selectedUri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      // Dosya adını benzersiz yapalım
      const fileExt = uri.split('.').pop();
      const fileName = `${user?.id || Date.now()}.${fileExt}`;
      const filePath = `profile_pics/${fileName}`;

      // URI'yi Blob'a dönüştürme (Supabase için en sağlıklı yöntem)
      const response = await fetch(uri);
      const blob = await response.blob();

      // Supabase Storage'a yükle (avatars bucket'ı varsa)
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
          contentType: `image/${fileExt}`
        });

      if (error) throw error;

      // Public URL al
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setNewAvatar(publicUrl);
      Alert.alert("Başarılı", "Fotoğraf yüklendi! Kaydet butonuna basarak güncelleyebilirsiniz.");
    } catch (error: any) {
      console.error("Yükleme Hatası:", error);
      Alert.alert("Bilgi", "Sunucu fotoğraf yüklemeyi reddetti. Deneme amaçlı yeni görsel seçildi, 'Kaydet' basarak devam edebilirsiniz.");
      // Fallback: Eğer storage kapalıysa direkt metadata'ya lokal uri atalım (test için)
      setNewAvatar(uri);
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profilim</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* PROFİL BİLGİLERİ */}
        <View style={styles.profileSection}>
          <Image
            source={{ uri: user?.user_metadata?.avatar_url || `https://avatar.iran.liara.run/public/boy?username=${user?.user_metadata?.full_name || user?.email || 'User'}` }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.user_metadata?.full_name || "Kullanıcı"}</Text>
            <Text style={styles.email}>{user?.email || "E-posta bulunamadı"}</Text>
            <TouchableOpacity style={styles.editButton} onPress={() => setProfileModalVisible(true)}>
              <Text style={styles.editButtonText}>Profili Düzenle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SADAKAT PROGRAMI */}
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

        {/* HESAP AYARLARI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Hesap Ayarları</Text>
          <TouchableOpacity style={styles.option} onPress={() => router.push("/orders")}>
            <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Sipariş Geçmişi</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Ödeme Yöntemleri</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={() => setPasswordModalVisible(true)}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Şifre Değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* UYGULAMA AYARLARI */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Uygulama ve Diğer</Text>
          <View style={styles.optionRow}>
            <View style={styles.optionLeft}>
              <Ionicons name="notifications-outline" size={20} color={COLORS.primary} />
              <Text style={styles.optionText}>Bildirim Ayarları</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#ccc", true: COLORS.accent }}
              thumbColor={notifications ? COLORS.primary : "#fff"}
            />
          </View>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="help-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Yardım ve Destek</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.optionText}>Hak ve Şartlar</Text>
          </TouchableOpacity>
        </View>

        {/* TEHLİKELİ İŞLEMLER */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Çıkış Yap</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteText}>Hesabı Sil</Text>
          </TouchableOpacity>
        </View>

        {/* MODALLAR */}
        
        {/* PROFİL DÜZENLE MODAL */}
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Profili Düzenle</Text>
                  <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Ad Soyad</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newName}
                    onChangeText={setNewName}
                    placeholder="Adınızı girin"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Profil Fotoğrafı</Text>
                  <View style={styles.photoContainer}>
                    <Image 
                      source={{ uri: newAvatar || `https://avatar.iran.liara.run/public/boy?username=${newName}` }}
                      style={styles.previewImage}
                    />
                    <TouchableOpacity style={styles.photoPickerButton} onPress={pickImage}>
                      <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                      <Text style={styles.photoPickerText}>Galeriden Seç</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, (loading || !newName) && { opacity: 0.7 }]} 
                  onPress={handleUpdateProfile}
                  disabled={loading || !newName}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "İşleniyor..." : "Değişiklikleri Kaydet"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

        {/* ŞİFRE DEĞİŞTİR MODAL */}
        <Modal
          visible={passwordModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                  <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                    <Ionicons name="close" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Yeni Şifre</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="En az 6 karakter"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Şifre Tekrar</Text>
                  <TextInput
                    style={styles.textInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Şifreyi tekrar girin"
                    placeholderTextColor={COLORS.textLight}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, loading && { opacity: 0.7 }]} 
                  onPress={handleChangePassword}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </Modal>

      </ScrollView>

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
        <NavItem
          icon="receipt-outline"
          label="Siparişlerim"
          onPress={() => router.push("/orders")}
          active={false}
        />
        <NavItem icon="person" label="Profilim" active={true} />
      </View>
    </SafeAreaView>
  );
}

// Navigasyon componenti: Diğer sayfalardaki gibi 'active' durumunu destekler
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
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 0) : 0,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Alt navigasyon barı için boşluk
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
    marginTop: 10,
    backgroundColor: COLORS.card,
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#ddd",
    marginRight: 15,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  email: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 2,
    marginBottom: 8,
  },
  editButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  editButtonText: {
    color: COLORS.accent,
    fontWeight: "600",
    fontSize: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 15,
    color: COLORS.primary,
  },
  loyaltyText: {
    color: COLORS.textDark,
    marginBottom: 15,
    fontSize: 14,
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
    paddingHorizontal: 15,
    borderRadius: 10,
    flex: 0.48, // Butonların eşit genişlikte olması için
    justifyContent: 'center'
  },
  loyaltyButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontWeight: "600",
    fontSize: 13,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  logoutText: {
    color: COLORS.accent,
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#FDECEA",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteText: {
    color: "#D32F2F",
    fontWeight: "700",
    fontSize: 15,
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
  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.primary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 8,
    marginLeft: 4,
  },
  textInput: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: COLORS.textDark,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  saveButtonText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: "700",
  },
  photoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
    backgroundColor: "#ddd",
  },
  photoPickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5E6E6",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  photoPickerText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontWeight: "700",
    fontSize: 14,
  },
});