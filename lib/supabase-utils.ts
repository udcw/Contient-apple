// lib/supabase-utils.ts
import { supabase } from './supabase';

/**
 * Types pour les données Supabase
 */
export interface Village {
  id: string;
  name: string;
  region: string;
  image_url: string | null;
  created_at: string;
}

export interface LexiqueEntry {
  id: string;
  village_id: string;
  french: string;
  local: string;
  audio_url: string | null;
  created_at: string;
}

export interface AlphabetEntry {
  id: string;
  village_id: string;
  french: string;
  local: string;
  audio_url: string | null;
  created_at: string;
}

export interface ProverbeEntry {
  id: string;
  village_id: string;
  content: string;
  translation: string | null;
  audio_url: string | null;
  created_at: string;
}

export interface MetsEntry {
  id: string;
  village_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface HistoireEntry {
  id: string;
  village_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
}

/**
 * Récupère tous les villages
 */
export async function getAllVillages(): Promise<Village[]> {
  try {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des villages:', error);
    return [];
  }
}

/**
 * Récupère un village par son ID
 */
export async function getVillageById(villageId: string): Promise<Village | null> {
  try {
    const { data, error } = await supabase
      .from('villages')
      .select('*')
      .eq('id', villageId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du village:', error);
    return null;
  }
}

/**
 * Récupère le lexique d'un village
 */
export async function getVillageLexique(villageId: string): Promise<LexiqueEntry[]> {
  try {
    const { data, error } = await supabase
      .from('lexique')
      .select('*')
      .eq('village_id', villageId)
      .order('french', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération du lexique:', error);
    return [];
  }
}

/**
 * Récupère l'alphabet d'un village
 */
export async function getVillageAlphabet(villageId: string): Promise<AlphabetEntry[]> {
  try {
    const { data, error } = await supabase
      .from('alphabet')
      .select('*')
      .eq('village_id', villageId)
      .order('french', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'alphabet:', error);
    return [];
  }
}

/**
 * Récupère les proverbes d'un village
 */
export async function getVillageProverbes(villageId: string): Promise<ProverbeEntry[]> {
  try {
    const { data, error } = await supabase
      .from('proverbes')
      .select('*')
      .eq('village_id', villageId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des proverbes:', error);
    return [];
  }
}

/**
 * Récupère les mets d'un village
 */
export async function getVillageMets(villageId: string): Promise<MetsEntry[]> {
  try {
    const { data, error } = await supabase
      .from('mets')
      .select('*')
      .eq('village_id', villageId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des mets:', error);
    return [];
  }
}

/**
 * Récupère les histoires d'un village
 */
export async function getVillageHistoires(villageId: string): Promise<HistoireEntry[]> {
  try {
    const { data, error } = await supabase
      .from('histoires')
      .select('*')
      .eq('village_id', villageId)
      .order('title', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des histoires:', error);
    return [];
  }
}

/**
 * Recherche dans le lexique d'un village
 */
export async function searchLexique(villageId: string, query: string): Promise<LexiqueEntry[]> {
  try {
    const { data, error } = await supabase
      .from('lexique')
      .select('*')
      .eq('village_id', villageId)
      .or(`french.ilike.%${query}%,local.ilike.%${query}%`)
      .order('french', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erreur lors de la recherche dans le lexique:', error);
    return [];
  }
}