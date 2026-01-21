/**
 * Helpers pour l'interaction avec Supabase
 * Fonctions utilitaires pour récupérer les données des villages
 */

import { supabase } from "@/lib/supabase";

// =============================
// TYPES
// =============================

export interface Village {
  id: string;
  name: string;
  region: string;
  image_url: string | null;
  created_at?: string;
}

export interface LexiqueEntry {
  id: string;
  village_id: string;
  french: string;
  local: string;
  audio_url: string | null;
  created_at?: string;
}

export interface AlphabetEntry {
  id: string;
  village_id: string;
  french: string;
  local: string;
  audio_url: string | null;
  created_at?: string;
}

export interface Proverbe {
  id: string;
  village_id: string;
  content: string;
  translation: string | null;
  audio_url: string | null;
  created_at?: string;
}

export interface Met {
  id: string;
  village_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at?: string;
}

export interface Histoire {
  id: string;
  village_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  audio_url: string | null;
  created_at?: string;
}

// =============================
// VILLAGES
// =============================

/**
 * Récupère tous les villages
 */
export async function getAllVillages(): Promise<Village[]> {
  try {
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des villages:", error);
    throw error;
  }
}

/**
 * Récupère un village par son ID
 */
export async function getVillageById(villageId: string): Promise<Village | null> {
  try {
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .eq("id", villageId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du village:", error);
    return null;
  }
}

/**
 * Récupère un village par son nom
 */
export async function getVillageByName(name: string): Promise<Village | null> {
  try {
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .eq("name", name)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Erreur lors de la récupération du village:", error);
    return null;
  }
}

/**
 * Récupère les villages par région
 */
export async function getVillagesByRegion(region: string): Promise<Village[]> {
  try {
    const { data, error } = await supabase
      .from("villages")
      .select("*")
      .eq("region", region)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des villages:", error);
    throw error;
  }
}

// =============================
// LEXIQUE
// =============================

/**
 * Récupère le lexique d'un village
 */
export async function getVillageLexique(villageId: string): Promise<LexiqueEntry[]> {
  try {
    const { data, error } = await supabase
      .from("lexique")
      .select("*")
      .eq("village_id", villageId)
      .order("french", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération du lexique:", error);
    throw error;
  }
}

/**
 * Recherche dans le lexique
 */
export async function searchLexique(
  villageId: string,
  searchTerm: string
): Promise<LexiqueEntry[]> {
  try {
    const { data, error } = await supabase
      .from("lexique")
      .select("*")
      .eq("village_id", villageId)
      .or(`french.ilike.%${searchTerm}%,local.ilike.%${searchTerm}%`)
      .order("french", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la recherche dans le lexique:", error);
    throw error;
  }
}

// =============================
// ALPHABET
// =============================

/**
 * Récupère l'alphabet d'un village
 */
export async function getVillageAlphabet(villageId: string): Promise<AlphabetEntry[]> {
  try {
    const { data, error } = await supabase
      .from("alphabet")
      .select("*")
      .eq("village_id", villageId)
      .order("french", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération de l'alphabet:", error);
    throw error;
  }
}

// =============================
// PROVERBES
// =============================

/**
 * Récupère les proverbes d'un village
 */
export async function getVillageProverbes(villageId: string): Promise<Proverbe[]> {
  try {
    const { data, error } = await supabase
      .from("proverbes")
      .select("*")
      .eq("village_id", villageId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des proverbes:", error);
    throw error;
  }
}

// =============================
// METS
// =============================

/**
 * Récupère les mets d'un village
 */
export async function getVillageMets(villageId: string): Promise<Met[]> {
  try {
    const { data, error } = await supabase
      .from("mets")
      .select("*")
      .eq("village_id", villageId)
      .order("name", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des mets:", error);
    throw error;
  }
}

// =============================
// HISTOIRES
// =============================

/**
 * Récupère les histoires d'un village
 */
export async function getVillageHistoires(villageId: string): Promise<Histoire[]> {
  try {
    const { data, error } = await supabase
      .from("histoires")
      .select("*")
      .eq("village_id", villageId)
      .order("title", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des histoires:", error);
    throw error;
  }
}

// =============================
// STATISTIQUES
// =============================

/**
 * Récupère les statistiques d'un village
 */
export async function getVillageStats(villageId: string) {
  try {
    const [lexique, alphabet, proverbes, mets, histoires] = await Promise.all([
      getVillageLexique(villageId),
      getVillageAlphabet(villageId),
      getVillageProverbes(villageId),
      getVillageMets(villageId),
      getVillageHistoires(villageId),
    ]);

    return {
      lexiqueCount: lexique.length,
      alphabetCount: alphabet.length,
      proverbesCount: proverbes.length,
      metsCount: mets.length,
      histoiresCount: histoires.length,
    };
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return {
      lexiqueCount: 0,
      alphabetCount: 0,
      proverbesCount: 0,
      metsCount: 0,
      histoiresCount: 0,
    };
  }
}

/**
 * Récupère toutes les données d'un village
 */
export async function getAllVillageData(villageId: string) {
  try {
    const [village, lexique, alphabet, proverbes, mets, histoires] =
      await Promise.all([
        getVillageById(villageId),
        getVillageLexique(villageId),
        getVillageAlphabet(villageId),
        getVillageProverbes(villageId),
        getVillageMets(villageId),
        getVillageHistoires(villageId),
      ]);

    return {
      village,
      lexique,
      alphabet,
      proverbes,
      mets,
      histoires,
    };
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données du village:",
      error
    );
    throw error;
  }
}