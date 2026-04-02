import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { useRouter } from "expo-router";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: "Sto je AI StanFinder?",
    answer:
      "AI StanFinder je pametna aplikacija koja koristi umjetnu inteligenciju " +
      "za pronalazenje nekretnina u Hrvatskoj. Postavite svoje filtere " +
      "(lokacija, cijena, velicina, broj soba) i AI ce automatski pretragivati " +
      "oglase i slati vam najbolje matcheve s detaljnim komentarom.",
  },
  {
    question: "Kako radi matching?",
    answer:
      "Nas AI sustav analizira svaki oglas prema vasim filterima i dodjeljuje " +
      "postotak podudarnosti (match score). Uzima u obzir cijenu, lokaciju, " +
      "kvadraturu, broj soba, stanje nekretnine i druge parametre. Rezultati " +
      "s najvisim scorom prikazuju se prvi.",
  },
  {
    question: "Koliko kosta premium?",
    answer:
      "Premium plan kosta 49.99 kn mjesecno (ili 449.99 kn godisnje uz " +
      "ustedu od 25%). Pro plan kosta 99.99 kn mjesecno. Besplatni plan " +
      "ukljucuje 2 pretrage dnevno i top 3 rezultata po filteru. Mozete " +
      "otkazati pretplatu u bilo kojem trenutku.",
  },
  {
    question: "Kako obrisati racun?",
    answer:
      "Idite u Profil > Obrisi racun. Ova akcija je nepovratna — svi vasi " +
      "podaci, filteri i spremljeni matchevi bit ce trajno obrisani. " +
      "Ako imate aktivnu pretplatu, najprije je otkazite putem " +
      "App Store ili Google Play.",
  },
  {
    question: "Kako kontaktirati podrsku?",
    answer:
      "Mozete nas kontaktirati putem emaila na podrska@stanfinder.hr ili " +
      "koristeci opciju 'Kontaktiraj nas' u profilu. Premium i Pro korisnici " +
      "imaju prioritetnu podrsku s prosjecnim vremenom odgovora od 2 sata.",
  },
];

function FaqAccordion({
  item,
  isExpanded,
  onToggle,
}: {
  item: FaqItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="bg-white border-b border-gray-100">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between px-4 py-4"
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={item.question}
      >
        <Text className="text-base font-medium text-gray-900 flex-1 mr-3">
          {item.question}
        </Text>
        <Text className="text-gray-400 text-lg">
          {isExpanded ? "−" : "+"}
        </Text>
      </TouchableOpacity>

      {isExpanded ? (
        <View className="px-4 pb-4">
          <Text className="text-sm text-gray-600 leading-5">
            {item.answer}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

export default function FaqScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  function handleToggle(index: number) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex((prev) => (prev === index ? null : index));
  }

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-white px-4 pt-14 pb-4 border-b border-gray-100 flex-row items-center">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-3 p-1"
          accessibilityLabel="Natrag"
          accessibilityRole="button"
        >
          <Text className="text-blue-600 text-2xl">&#8249;</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
          Cesta pitanja
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">
          FAQ
        </Text>

        {FAQ_DATA.map((item, index) => (
          <FaqAccordion
            key={item.question}
            item={item}
            isExpanded={expandedIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}

        <View className="px-4 py-8">
          <Text className="text-sm text-gray-500 text-center">
            Niste pronasli odgovor? Kontaktirajte nas na{"\n"}
            podrska@stanfinder.hr
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
