import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/utils/supabase";
import { decode } from "base64-arraybuffer";
import { router } from "expo-router";
import { newsAddedSuccessToast } from "@/constants/messages";

// Define form values separately from the full NewsType
type FormValues = {
  title: string;
  content: string;
  external_urls: string;
  internal_urls: string;
  language_code: string;
  is_pinned: boolean;
};

export function useAddNews() {
  // React Hook Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      content: "",
      external_urls: "",
      internal_urls: "",
      language_code: "de",
      is_pinned: false,
    },
  });

  // State for images and uploading
  const [selectedImages, setSelectedImages] = useState<
    {
      uri: string;
      base64: string | null;
    }[]
  >([]);
  const [uploading, setUploading] = useState(false);

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((img) => img.uri !== uri));
  };

  const pickImages = async () => {
    // Permission checks omitted for brevity; same as before
    // ...
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      base64: true,
      selectionLimit: 10,
    });

    if (!result.canceled && result.assets) {
      const images = result.assets.map((asset) => ({
        uri: asset.uri,
        base64: asset.base64 ?? null,
      }));
      setSelectedImages((prev) => [...prev, ...images]);
    }
  };

  const uploadImages = async (
    images: { uri: string; base64: string | null }[]
  ) => {
    const uploadedUrls: string[] = [];
    for (const { uri, base64 } of images) {
      if (!base64) continue;
      const ext = uri.split(".").pop()?.toLowerCase();
      if (!ext || !["jpg", "jpeg", "png", "gif"].includes(ext)) continue;
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}.${ext}`;
      const contentType = `image/${ext}`;
      const arrayBuffer = decode(base64);
      const { error } = await supabase.storage
        .from("news")
        .upload(`images/${fileName}`, arrayBuffer, {
          contentType,
          cacheControl: "3600",
          upsert: true,
        });
      if (error) continue;
      const { data: pub } = supabase.storage
        .from("news")
        .getPublicUrl(`images/${fileName}`);
      if (pub?.publicUrl) uploadedUrls.push(pub.publicUrl);
    }
    return uploadedUrls.length > 0 ? uploadedUrls : null;
  };

  const onSubmit = async (formData: FormValues) => {
    if (uploading) return;

    // Prevent empty submission
    if (
      !formData.title.trim() &&
      !formData.content.trim() &&
      !formData.external_urls.trim() &&
      !formData.internal_urls.trim() &&
      selectedImages.length === 0
    ) {
      Alert.alert(
        "Fehler",
        "Die Nachricht kann nicht leer sein! Bitte gib einen Titel oder Inhalt ein oder lade ein Bild hoch."
      );
      return;
    }

    setUploading(true);
    try {
      let uploadedImageUrls: string[] | null = null;
      if (selectedImages.length > 0) {
        uploadedImageUrls = await uploadImages(selectedImages);
        if (!uploadedImageUrls) {
          Alert.alert("Error", "Image upload failed. Please try again.");
          setUploading(false);
          return;
        }
      }

      // Convert comma-separated strings into arrays
      const externalUrlsArray = formData.external_urls
        ? formData.external_urls
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        : [];
      const internalUrlsArray = formData.internal_urls
        ? formData.internal_urls
            .split(",")
            .map((url) => url.trim())
            .filter(Boolean)
        : [];

      const { error } = await supabase.from("news").insert([
        {
          title: formData.title,
          content: formData.content,
          images_url: uploadedImageUrls ?? [],
          external_urls: externalUrlsArray,
          internal_urls: internalUrlsArray,
          language_code: formData.language_code,
          is_pinned: formData.is_pinned,
        },
      ]);

      if (error) throw error;

      reset();
      setSelectedImages([]);
      newsAddedSuccessToast();
      router.push("/(tabs)/home");
    } catch (err: any) {
      console.error("Error submitting news:", err.message);
      Alert.alert("Error", "An error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return {
    control,
    handleSubmit,
    errors,
    selectedImages,
    uploading,
    pickImages,
    removeImage,
    onSubmit,
  };
}
