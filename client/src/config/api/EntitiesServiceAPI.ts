import axios from 'axios';

export interface Well {
    name: string;
    start_measured_depth: number;
    end_measured_depth: number;
    id: number;
}

export interface WellTracks {
    id: number;
    well_id: number;
    lat: number;
    lon: number;
    absolute_depth: number;
    measured_depth: number;
}

export interface Curves {
    id: number;
    well_id: number;
    measured_depth: number;
    type: string;
}

export interface FormationThickness {
    id: number;
    well_id: number;
    lat: number;
    lon: number;
    absolute_depth: number;
    thickness: number;
}
export interface EffectiveFormationThickness {
    id: number;
    well_id: number;
    lat: number;
    lon: number;
    absolute_depth: number;
    thickness: number;
}

export class EntitiesServiceAPI {
    private instance = axios.create({
        baseURL: import.meta.env.VITE_CORE_API + '/api/v1/files/entities',
        timeout: 5000,
    });

    /* list wells */
    async getListWells(): Promise<Well[]> {
        const response = await this.instance.get<Well[]>(`/wells`);
        return response.data;
    }

    /* list welltracks */
    async getListWelltracks(): Promise<WellTracks[]> {
        const response = await this.instance.get<WellTracks[]>(`/welltracks`);
        return response.data;
    }

    /* list curves */
    async getListCurves(): Promise<Curves[]> {
        const response = await this.instance.get<Curves[]>(`/curves`);
        return response.data;
    }

    /* list formation thickness */
    async getFormationThickness(): Promise<FormationThickness[]> {
        const response = await this.instance.get<FormationThickness[]>(`/formation-thickness`);
        return response.data;
    }

    /* list  effective formation thickness */
    async getEffectiveFormationThickness(): Promise<EffectiveFormationThickness[]> {
        const response = await this.instance.get<EffectiveFormationThickness[]>(
            `/effective-formation-thickness`,
        );
        return response.data;
    }
}
