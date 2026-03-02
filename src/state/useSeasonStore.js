import { create } from 'zustand';
import { supabase } from '../utils/supabaseClient';

export const useSeasonStore = create((set, get) => ({
    currentSeason: 'Winter',
    seasons: ['Winter', 'Spring', 'Summer', 'Autumn'],

    setSeason: async (season) => {
        set({ currentSeason: season });

        // Persist to Supabase
        const { error } = await supabase
            .from('site_settings')
            .upsert({ id: 1, current_season: season, updated_at: new Date() });

        if (error) console.error('Error persisting season:', error.message);
    },

    fetchSeason: async () => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('current_season')
            .eq('id', 1)
            .single();

        if (error) {
            console.warn('Could not fetch season (check if table exists):', error.message);
            return;
        }

        if (data && data.current_season) {
            set({ currentSeason: data.current_season });
        }
    },
}));
