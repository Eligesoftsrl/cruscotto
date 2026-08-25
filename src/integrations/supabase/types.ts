export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      ca_anzianita: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          donne: number | null
          fascia_id: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          fascia_id?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          fascia_id?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_anzianita_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_anzianita_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_anzianita_fascia_id_fkey"
            columns: ["fascia_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_fasce_anzianita"
            referencedColumns: ["fascia_id"]
          },
          {
            foreignKeyName: "ca_anzianita_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_anzianita_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_anzianita_media: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          donne: number | null
          id: number
          istituzione_id: number
          media: number | null
          media_donne: number | null
          media_uomini: number | null
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id: number
          media?: number | null
          media_donne?: number | null
          media_uomini?: number | null
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id?: number
          media?: number | null
          media_donne?: number | null
          media_uomini?: number | null
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_anzianita_media_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_anzianita_media_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_anzianita_media_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_anzianita_media_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_assenze: {
        Row: {
          anno: number
          categoria_id: number | null
          causale_id: number | null
          contratto_id: number | null
          giorni_donne: number | null
          giorni_uomini: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          giorni_donne?: number | null
          giorni_uomini?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          giorni_donne?: number | null
          giorni_uomini?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_assenze_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_assenze_causale_id_fkey"
            columns: ["causale_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_causali_assenza"
            referencedColumns: ["causale_id"]
          },
          {
            foreignKeyName: "ca_assenze_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_assenze_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_assenze_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_assunti: {
        Row: {
          anno: number
          categoria_id: number | null
          causale_id: number | null
          contratto_id: number | null
          donne: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_assunti_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_assunti_causale_id_fkey"
            columns: ["causale_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_causali_assunzione"
            referencedColumns: ["causale_id"]
          },
          {
            foreignKeyName: "ca_assunti_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_assunti_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_assunti_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_cessati: {
        Row: {
          anno: number
          categoria_id: number | null
          causale_id: number | null
          contratto_id: number | null
          donne: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          causale_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_cessati_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_cessati_causale_id_fkey"
            columns: ["causale_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_causali_cessazione"
            referencedColumns: ["causale_id"]
          },
          {
            foreignKeyName: "ca_cessati_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_cessati_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_cessati_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_comandati: {
        Row: {
          anno: number
          aspettative_donne: number | null
          aspettative_uomini: number | null
          categoria_id: number | null
          comandati_distaccati_donne: number | null
          comandati_distaccati_esterno_donne: number | null
          comandati_distaccati_esterno_uomini: number | null
          comandati_distaccati_uomini: number | null
          contratto_id: number | null
          convenzioni_donne: number | null
          convenzioni_esterno_donne: number | null
          convenzioni_esterno_uomini: number | null
          convenzioni_uomini: number | null
          esoneri_donne: number | null
          esoneri_uomini: number | null
          fuori_ruolo_donne: number | null
          fuori_ruolo_esterno_donne: number | null
          fuori_ruolo_esterno_uomini: number | null
          fuori_ruolo_uomini: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
        }
        Insert: {
          anno?: number
          aspettative_donne?: number | null
          aspettative_uomini?: number | null
          categoria_id?: number | null
          comandati_distaccati_donne?: number | null
          comandati_distaccati_esterno_donne?: number | null
          comandati_distaccati_esterno_uomini?: number | null
          comandati_distaccati_uomini?: number | null
          contratto_id?: number | null
          convenzioni_donne?: number | null
          convenzioni_esterno_donne?: number | null
          convenzioni_esterno_uomini?: number | null
          convenzioni_uomini?: number | null
          esoneri_donne?: number | null
          esoneri_uomini?: number | null
          fuori_ruolo_donne?: number | null
          fuori_ruolo_esterno_donne?: number | null
          fuori_ruolo_esterno_uomini?: number | null
          fuori_ruolo_uomini?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
        }
        Update: {
          anno?: number
          aspettative_donne?: number | null
          aspettative_uomini?: number | null
          categoria_id?: number | null
          comandati_distaccati_donne?: number | null
          comandati_distaccati_esterno_donne?: number | null
          comandati_distaccati_esterno_uomini?: number | null
          comandati_distaccati_uomini?: number | null
          contratto_id?: number | null
          convenzioni_donne?: number | null
          convenzioni_esterno_donne?: number | null
          convenzioni_esterno_uomini?: number | null
          convenzioni_uomini?: number | null
          esoneri_donne?: number | null
          esoneri_uomini?: number | null
          fuori_ruolo_donne?: number | null
          fuori_ruolo_esterno_donne?: number | null
          fuori_ruolo_esterno_uomini?: number | null
          fuori_ruolo_uomini?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_comandati_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_comandati_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_comandati_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_comandati_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_eta: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          donne: number | null
          fascia_id: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          fascia_id?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          fascia_id?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_eta_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_eta_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_eta_fascia_id_fkey"
            columns: ["fascia_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_fasce_eta"
            referencedColumns: ["fascia_id"]
          },
          {
            foreignKeyName: "ca_eta_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_eta_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_eta_media: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          donne: number | null
          id: number
          istituzione_id: number
          media: number | null
          media_donne: number | null
          media_uomini: number | null
          qualifica_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id: number
          media?: number | null
          media_donne?: number | null
          media_uomini?: number | null
          qualifica_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id?: number
          media?: number | null
          media_donne?: number | null
          media_uomini?: number | null
          qualifica_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_eta_media_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_eta_media_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_eta_media_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_eta_media_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_formazione: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          formati_donne: number | null
          formati_uomini: number | null
          giornate_medie_donne: number | null
          giornate_medie_uomini: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          formati_donne?: number | null
          formati_uomini?: number | null
          giornate_medie_donne?: number | null
          giornate_medie_uomini?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          formati_donne?: number | null
          formati_uomini?: number | null
          giornate_medie_donne?: number | null
          giornate_medie_uomini?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_formazione_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_formazione_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_formazione_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_formazione_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_lavoro_flessibile: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          formazione_lavoro_donne: number | null
          formazione_lavoro_uomini: number | null
          id: number
          interinale_donne: number | null
          interinale_uomini: number | null
          istituzione_id: number
          lsu_donne: number | null
          lsu_uomini: number | null
          qualifica_id: number | null
          tempo_determinato_donne: number | null
          tempo_determinato_uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          formazione_lavoro_donne?: number | null
          formazione_lavoro_uomini?: number | null
          id?: number
          interinale_donne?: number | null
          interinale_uomini?: number | null
          istituzione_id: number
          lsu_donne?: number | null
          lsu_uomini?: number | null
          qualifica_id?: number | null
          tempo_determinato_donne?: number | null
          tempo_determinato_uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          formazione_lavoro_donne?: number | null
          formazione_lavoro_uomini?: number | null
          id?: number
          interinale_donne?: number | null
          interinale_uomini?: number | null
          istituzione_id?: number
          lsu_donne?: number | null
          lsu_uomini?: number | null
          qualifica_id?: number | null
          tempo_determinato_donne?: number | null
          tempo_determinato_uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_lavoro_flessibile_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_lavoro_flessibile_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_lavoro_flessibile_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_lavoro_flessibile_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_lk_categorie: {
        Row: {
          categoria_id: number
          codice: string
          contratto_id: number | null
          descrizione: string
        }
        Insert: {
          categoria_id?: number
          codice: string
          contratto_id?: number | null
          descrizione: string
        }
        Update: {
          categoria_id?: number
          codice?: string
          contratto_id?: number | null
          descrizione?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_lk_categorie_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
        ]
      }
      ca_lk_causali_assenza: {
        Row: {
          causale_id: number
          codice: string
          descrizione: string
        }
        Insert: {
          causale_id?: number
          codice: string
          descrizione: string
        }
        Update: {
          causale_id?: number
          codice?: string
          descrizione?: string
        }
        Relationships: []
      }
      ca_lk_causali_assunzione: {
        Row: {
          causale_id: number
          codice: string
          descrizione: string
        }
        Insert: {
          causale_id?: number
          codice: string
          descrizione: string
        }
        Update: {
          causale_id?: number
          codice?: string
          descrizione?: string
        }
        Relationships: []
      }
      ca_lk_causali_cessazione: {
        Row: {
          causale_id: number
          codice: string
          descrizione: string
        }
        Insert: {
          causale_id?: number
          codice: string
          descrizione: string
        }
        Update: {
          causale_id?: number
          codice?: string
          descrizione?: string
        }
        Relationships: []
      }
      ca_lk_contratti: {
        Row: {
          codice: string
          contratto_id: number
          descrizione: string
        }
        Insert: {
          codice: string
          contratto_id?: number
          descrizione: string
        }
        Update: {
          codice?: string
          contratto_id?: number
          descrizione?: string
        }
        Relationships: []
      }
      ca_lk_fasce_anzianita: {
        Row: {
          anni_max: number | null
          anni_min: number | null
          codice: string
          descrizione: string
          fascia_id: number
        }
        Insert: {
          anni_max?: number | null
          anni_min?: number | null
          codice: string
          descrizione: string
          fascia_id?: number
        }
        Update: {
          anni_max?: number | null
          anni_min?: number | null
          codice?: string
          descrizione?: string
          fascia_id?: number
        }
        Relationships: []
      }
      ca_lk_fasce_eta: {
        Row: {
          codice: string
          descrizione: string
          eta_max: number | null
          eta_min: number | null
          fascia_id: number
        }
        Insert: {
          codice: string
          descrizione: string
          eta_max?: number | null
          eta_min?: number | null
          fascia_id?: number
        }
        Update: {
          codice?: string
          descrizione?: string
          eta_max?: number | null
          eta_min?: number | null
          fascia_id?: number
        }
        Relationships: []
      }
      ca_lk_qualifiche: {
        Row: {
          categoria_id: number | null
          codice: string
          descrizione: string
          qualifica_id: number
        }
        Insert: {
          categoria_id?: number | null
          codice: string
          descrizione: string
          qualifica_id?: number
        }
        Update: {
          categoria_id?: number | null
          codice?: string
          descrizione?: string
          qualifica_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ca_lk_qualifiche_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
        ]
      }
      ca_lk_titoli_studio: {
        Row: {
          codice: string
          descrizione: string
          titolo_id: number
        }
        Insert: {
          codice: string
          descrizione: string
          titolo_id?: number
        }
        Update: {
          codice?: string
          descrizione?: string
          titolo_id?: number
        }
        Relationships: []
      }
      ca_modalita_lavoro: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          id: number
          istituzione_id: number
          lavoro_agile_donne: number | null
          lavoro_agile_uomini: number | null
          qualifica_id: number | null
          reperibilita_donne: number | null
          reperibilita_uomini: number | null
          telelavoro_donne: number | null
          telelavoro_uomini: number | null
          turnazione_donne: number | null
          turnazione_uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          id?: number
          istituzione_id: number
          lavoro_agile_donne?: number | null
          lavoro_agile_uomini?: number | null
          qualifica_id?: number | null
          reperibilita_donne?: number | null
          reperibilita_uomini?: number | null
          telelavoro_donne?: number | null
          telelavoro_uomini?: number | null
          turnazione_donne?: number | null
          turnazione_uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          id?: number
          istituzione_id?: number
          lavoro_agile_donne?: number | null
          lavoro_agile_uomini?: number | null
          qualifica_id?: number | null
          reperibilita_donne?: number | null
          reperibilita_uomini?: number | null
          telelavoro_donne?: number | null
          telelavoro_uomini?: number | null
          turnazione_donne?: number | null
          turnazione_uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_modalita_lavoro_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_modalita_lavoro_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_modalita_lavoro_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_modalita_lavoro_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_occupazione: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          id: number
          istituzione_id: number
          part_time_inf50_donne: number | null
          part_time_inf50_uomini: number | null
          part_time_sup50_donne: number | null
          part_time_sup50_uomini: number | null
          personale_tempo_pieno_donne: number | null
          personale_tempo_pieno_uomini: number | null
          qualifica_id: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          id?: number
          istituzione_id: number
          part_time_inf50_donne?: number | null
          part_time_inf50_uomini?: number | null
          part_time_sup50_donne?: number | null
          part_time_sup50_uomini?: number | null
          personale_tempo_pieno_donne?: number | null
          personale_tempo_pieno_uomini?: number | null
          qualifica_id?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          id?: number
          istituzione_id?: number
          part_time_inf50_donne?: number | null
          part_time_inf50_uomini?: number | null
          part_time_sup50_donne?: number | null
          part_time_sup50_uomini?: number | null
          personale_tempo_pieno_donne?: number | null
          personale_tempo_pieno_uomini?: number | null
          qualifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_occupazione_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_occupazione_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_occupazione_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_occupazione_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
        ]
      }
      ca_titolo_studio: {
        Row: {
          anno: number
          categoria_id: number | null
          contratto_id: number | null
          donne: number | null
          id: number
          istituzione_id: number
          qualifica_id: number | null
          titolo_id: number | null
          uomini: number | null
        }
        Insert: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id: number
          qualifica_id?: number | null
          titolo_id?: number | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria_id?: number | null
          contratto_id?: number | null
          donne?: number | null
          id?: number
          istituzione_id?: number
          qualifica_id?: number | null
          titolo_id?: number | null
          uomini?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_titolo_studio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_categorie"
            referencedColumns: ["categoria_id"]
          },
          {
            foreignKeyName: "ca_titolo_studio_contratto_id_fkey"
            columns: ["contratto_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_contratti"
            referencedColumns: ["contratto_id"]
          },
          {
            foreignKeyName: "ca_titolo_studio_istituzione_id_fkey"
            columns: ["istituzione_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ca_titolo_studio_qualifica_id_fkey"
            columns: ["qualifica_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_qualifiche"
            referencedColumns: ["qualifica_id"]
          },
          {
            foreignKeyName: "ca_titolo_studio_titolo_id_fkey"
            columns: ["titolo_id"]
            isOneToOne: false
            referencedRelation: "ca_lk_titoli_studio"
            referencedColumns: ["titolo_id"]
          },
        ]
      }
      dw_anagrafica_lp: {
        Row: {
          cfiscale: string | null
          classe_tipo_amm: string | null
          cod_comparto: string | null
          cod_contratto: string | null
          cod_tipo: string | null
          codice_ipa: string | null
          comparto: string | null
          denominazione: string | null
          id_lp: number
          pr_sigla: string | null
          provincia: string | null
          regione: string | null
          stato: number | null
          tipo_istituzione: string | null
        }
        Insert: {
          cfiscale?: string | null
          classe_tipo_amm?: string | null
          cod_comparto?: string | null
          cod_contratto?: string | null
          cod_tipo?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          denominazione?: string | null
          id_lp: number
          pr_sigla?: string | null
          provincia?: string | null
          regione?: string | null
          stato?: number | null
          tipo_istituzione?: string | null
        }
        Update: {
          cfiscale?: string | null
          classe_tipo_amm?: string | null
          cod_comparto?: string | null
          cod_contratto?: string | null
          cod_tipo?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          denominazione?: string | null
          id_lp?: number
          pr_sigla?: string | null
          provincia?: string | null
          regione?: string | null
          stato?: number | null
          tipo_istituzione?: string | null
        }
        Relationships: []
      }
      dw_assunti: {
        Row: {
          anno: number
          categoria: string | null
          causale: string | null
          contratto: string | null
          donne: number | null
          id: number
          istituzione: number
          qualifica: string | null
          uomini: number | null
        }
        Insert: {
          anno: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione: number
          qualifica?: string | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione?: number
          qualifica?: string | null
          uomini?: number | null
        }
        Relationships: []
      }
      dw_bridge_profilo_competenza: {
        Row: {
          cfiscale_ente: string | null
          cod_competenza: string | null
          cod_profilo_di_ruolo: string | null
          dipendenti_totali_profilo: number | null
          dipendenti_valutati: number | null
          id: number
          id_ente: number | null
          livello_target: number | null
          livello_valutato_medio: number | null
        }
        Insert: {
          cfiscale_ente?: string | null
          cod_competenza?: string | null
          cod_profilo_di_ruolo?: string | null
          dipendenti_totali_profilo?: number | null
          dipendenti_valutati?: number | null
          id?: number
          id_ente?: number | null
          livello_target?: number | null
          livello_valutato_medio?: number | null
        }
        Update: {
          cfiscale_ente?: string | null
          cod_competenza?: string | null
          cod_profilo_di_ruolo?: string | null
          dipendenti_totali_profilo?: number | null
          dipendenti_valutati?: number | null
          id?: number
          id_ente?: number | null
          livello_target?: number | null
          livello_valutato_medio?: number | null
        }
        Relationships: []
      }
      dw_causali: {
        Row: {
          cod_alfa: string | null
          descrizione: string | null
          id: number
          is_ti: number | null
          tipo: string | null
        }
        Insert: {
          cod_alfa?: string | null
          descrizione?: string | null
          id?: number
          is_ti?: number | null
          tipo?: string | null
        }
        Update: {
          cod_alfa?: string | null
          descrizione?: string | null
          id?: number
          is_ti?: number | null
          tipo?: string | null
        }
        Relationships: []
      }
      dw_cessati: {
        Row: {
          anno: number
          categoria: string | null
          causale: string | null
          contratto: string | null
          donne: number | null
          id: number
          istituzione: number
          qualifica: string | null
          uomini: number | null
        }
        Insert: {
          anno: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione: number
          qualifica?: string | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione?: number
          qualifica?: string | null
          uomini?: number | null
        }
        Relationships: []
      }
      dw_comparto_contratto: {
        Row: {
          cod_comparto: string | null
          cod_contratto: string | null
          desc_comparto: string | null
          desc_contratto: string | null
          id: number
        }
        Insert: {
          cod_comparto?: string | null
          cod_contratto?: string | null
          desc_comparto?: string | null
          desc_contratto?: string | null
          id?: number
        }
        Update: {
          cod_comparto?: string | null
          cod_contratto?: string | null
          desc_comparto?: string | null
          desc_contratto?: string | null
          id?: number
        }
        Relationships: []
      }
      dw_competenza: {
        Row: {
          area: string | null
          codice: string
          tipo: string | null
          titolo: string | null
        }
        Insert: {
          area?: string | null
          codice: string
          tipo?: string | null
          titolo?: string | null
        }
        Update: {
          area?: string | null
          codice?: string
          tipo?: string | null
          titolo?: string | null
        }
        Relationships: []
      }
      dw_ente: {
        Row: {
          categoria_cruscotto: string | null
          cfiscale: string | null
          classe_amministrazione: string | null
          cod_comparto: string | null
          cod_contratto: string | null
          cod_tipo: string | null
          codice_ipa: string | null
          comparto: string | null
          contratto: string | null
          denominazione: string
          id_ente: number
          organico_2023: number | null
          profilo_prestazionale: string | null
          regione: string | null
          stato: number | null
          tipo_istituzione: string | null
        }
        Insert: {
          categoria_cruscotto?: string | null
          cfiscale?: string | null
          classe_amministrazione?: string | null
          cod_comparto?: string | null
          cod_contratto?: string | null
          cod_tipo?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          contratto?: string | null
          denominazione: string
          id_ente: number
          organico_2023?: number | null
          profilo_prestazionale?: string | null
          regione?: string | null
          stato?: number | null
          tipo_istituzione?: string | null
        }
        Update: {
          categoria_cruscotto?: string | null
          cfiscale?: string | null
          classe_amministrazione?: string | null
          cod_comparto?: string | null
          cod_contratto?: string | null
          cod_tipo?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          contratto?: string | null
          denominazione?: string
          id_ente?: number
          organico_2023?: number | null
          profilo_prestazionale?: string | null
          regione?: string | null
          stato?: number | null
          tipo_istituzione?: string | null
        }
        Relationships: []
      }
      dw_eta: {
        Row: {
          anno: number
          contratto: string | null
          donne: number | null
          fascia_eta: string | null
          id: number
          istituzione: number
          uomini: number | null
        }
        Insert: {
          anno: number
          contratto?: string | null
          donne?: number | null
          fascia_eta?: string | null
          id?: number
          istituzione: number
          uomini?: number | null
        }
        Update: {
          anno?: number
          contratto?: string | null
          donne?: number | null
          fascia_eta?: string | null
          id?: number
          istituzione?: number
          uomini?: number | null
        }
        Relationships: []
      }
      dw_famiglia_professionale: {
        Row: {
          codice: string
          comparto: string | null
          dimensione_professionale: string | null
          titolo: string | null
        }
        Insert: {
          codice: string
          comparto?: string | null
          dimensione_professionale?: string | null
          titolo?: string | null
        }
        Update: {
          codice?: string
          comparto?: string | null
          dimensione_professionale?: string | null
          titolo?: string | null
        }
        Relationships: []
      }
      dw_fascia_eta: {
        Row: {
          classe: string | null
          codice: string
          eta_max: number | null
          eta_min: number | null
        }
        Insert: {
          classe?: string | null
          codice: string
          eta_max?: number | null
          eta_min?: number | null
        }
        Update: {
          classe?: string | null
          codice?: string
          eta_max?: number | null
          eta_min?: number | null
        }
        Relationships: []
      }
      dw_formazione: {
        Row: {
          anno: number
          categoria: string | null
          causale: string | null
          contratto: string | null
          form_donne: number | null
          form_uomini: number | null
          id: number
          istituzione: number
          ore_media_d: number | null
          ore_media_u: number | null
          qualifica: string | null
        }
        Insert: {
          anno: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          form_donne?: number | null
          form_uomini?: number | null
          id?: number
          istituzione: number
          ore_media_d?: number | null
          ore_media_u?: number | null
          qualifica?: string | null
        }
        Update: {
          anno?: number
          categoria?: string | null
          causale?: string | null
          contratto?: string | null
          form_donne?: number | null
          form_uomini?: number | null
          id?: number
          istituzione?: number
          ore_media_d?: number | null
          ore_media_u?: number | null
          qualifica?: string | null
        }
        Relationships: []
      }
      dw_inpa_bandi: {
        Row: {
          anno: number | null
          categoria_ipa: string | null
          cfiscale_pa: string | null
          codice: string | null
          data_pubblicazione: string | null
          data_scadenza: string | null
          fascia_retributiva: string | null
          figura_ricercata: string | null
          id: number
          id_ente: number | null
          num_candidature_submitted: number | null
          num_posti: number | null
          provincia: string | null
          regione: string | null
          settore_pubblicazione: string | null
          stato_bando: string | null
          tipo_procedura: string | null
          tipologia_ipa: string | null
        }
        Insert: {
          anno?: number | null
          categoria_ipa?: string | null
          cfiscale_pa?: string | null
          codice?: string | null
          data_pubblicazione?: string | null
          data_scadenza?: string | null
          fascia_retributiva?: string | null
          figura_ricercata?: string | null
          id: number
          id_ente?: number | null
          num_candidature_submitted?: number | null
          num_posti?: number | null
          provincia?: string | null
          regione?: string | null
          settore_pubblicazione?: string | null
          stato_bando?: string | null
          tipo_procedura?: string | null
          tipologia_ipa?: string | null
        }
        Update: {
          anno?: number | null
          categoria_ipa?: string | null
          cfiscale_pa?: string | null
          codice?: string | null
          data_pubblicazione?: string | null
          data_scadenza?: string | null
          fascia_retributiva?: string | null
          figura_ricercata?: string | null
          id?: number
          id_ente?: number | null
          num_candidature_submitted?: number | null
          num_posti?: number | null
          provincia?: string | null
          regione?: string | null
          settore_pubblicazione?: string | null
          stato_bando?: string | null
          tipo_procedura?: string | null
          tipologia_ipa?: string | null
        }
        Relationships: []
      }
      dw_inpa_candidati: {
        Row: {
          anno: number | null
          area_geografica: string | null
          fascia_eta: string | null
          genere: string | null
          id: number
          id_bando: number | null
          num_candidature: number | null
          regione: string | null
          titolo_studio: string | null
        }
        Insert: {
          anno?: number | null
          area_geografica?: string | null
          fascia_eta?: string | null
          genere?: string | null
          id?: never
          id_bando?: number | null
          num_candidature?: number | null
          regione?: string | null
          titolo_studio?: string | null
        }
        Update: {
          anno?: number | null
          area_geografica?: string | null
          fascia_eta?: string | null
          genere?: string | null
          id?: never
          id_bando?: number | null
          num_candidature?: number | null
          regione?: string | null
          titolo_studio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dw_inpa_candidati_id_bando_fkey"
            columns: ["id_bando"]
            isOneToOne: false
            referencedRelation: "dw_inpa_bandi"
            referencedColumns: ["id"]
          },
        ]
      }
      dw_kpi_rilevazione: {
        Row: {
          cfiscale: string | null
          denominazione: string | null
          dimensione_amm: string | null
          id: number
          id_ente: number | null
          q1_1_adozione_modello: string | null
          q1_2_library_processi: string | null
          q1_3_dizionario_competenze: string | null
          q1_5_n_profili_definiti: string | null
          q1_6_n_profili_competenze: string | null
          q1_profili_totali: string | null
          q2_1_assunti_under35: string | null
          q2_1_assunzioni_turnover: string | null
          q2_2_assunti_ti: string | null
          q2_2_eq_ep_assunti: string | null
          q2_3_assunzioni_prog: string | null
          q2_4_assunzioni_turnover_tot: string | null
          q2_5_assessment: string | null
          q2_5_assunzioni_su_prog: string | null
          q2_assunzioni_totali: string | null
          q3_1_concorsi_comp_trasv: string | null
          q3_2_onboarding: string | null
          q3_3_apprendistato: string | null
          q3_4_concorsi_profili_cb: string | null
          q3_5_concorsi_dizionario: string | null
          q3_concorsi_totali: string | null
          q4_1_rilevazione_gap: string | null
          q4_2_formazione_trasv: string | null
          q4_percorsi_totali: string | null
          q5_1_integrazione_performance: string | null
          q5_2_incentivazione_non_mon: string | null
          q5_3_convenzioni_universita: string | null
          q6_1_processi_semplificati: string | null
          q6_12_donne_agile_pct: string | null
          q6_13_sw_hr_nuovi: string | null
          q6_14_progressioni_oriz: string | null
          q6_14_progressioni_vert: string | null
          q6_15_eq_ep_under35: string | null
          q6_16_donne_agile: string | null
          q6_16_mobilita_out: string | null
          q6_16_uomini_agile: string | null
          q6_17_gg_agile_donne: string | null
          q6_17_mobilita_in: string | null
          q6_18_donne_dirigenti: string | null
          q6_18_gg_totali: string | null
          q6_19_strumenti_ict: string | null
          q6_20_entrati_mobilita: string | null
          q6_3_dirigente: string | null
          q6_3_non_dirigente: string | null
          q6_4_posti_vacanti_nondir: string | null
          q6_4_ti_dir_donne: string | null
          q6_4_ti_dir_uomini: string | null
          q6_4_ti_nondir_donne: string | null
          q6_4_ti_nondir_uomini: string | null
          q6_5_posti_vacanti_dir: string | null
          q6_5_td_dir_donne: string | null
          q6_5_td_dir_uomini: string | null
          q6_6_under35: string | null
          q6_7_eq_ep: string | null
          q6_8_eq_ep_under45: string | null
          q6_9_lavoro_flessibile: string | null
          q6_comandati_in: string | null
          q6_comandati_out: string | null
          q6_dip_flessibili: string | null
          q6_entrati: string | null
          q6_organico_medio: string | null
          q6_pianta_organica_dir: string | null
          q6_pianta_organica_nondir: string | null
          q6_processi_totali: string | null
          q6_sw_hr_totali: string | null
          q6_tep_personale: string | null
          q6_totale_dirigenti: string | null
          q6_totale_donne: string | null
          q6_usciti: string | null
          regione: string | null
          segmento: string | null
          semestre: string | null
          status: string | null
          tipologia_amm: string | null
        }
        Insert: {
          cfiscale?: string | null
          denominazione?: string | null
          dimensione_amm?: string | null
          id?: number
          id_ente?: number | null
          q1_1_adozione_modello?: string | null
          q1_2_library_processi?: string | null
          q1_3_dizionario_competenze?: string | null
          q1_5_n_profili_definiti?: string | null
          q1_6_n_profili_competenze?: string | null
          q1_profili_totali?: string | null
          q2_1_assunti_under35?: string | null
          q2_1_assunzioni_turnover?: string | null
          q2_2_assunti_ti?: string | null
          q2_2_eq_ep_assunti?: string | null
          q2_3_assunzioni_prog?: string | null
          q2_4_assunzioni_turnover_tot?: string | null
          q2_5_assessment?: string | null
          q2_5_assunzioni_su_prog?: string | null
          q2_assunzioni_totali?: string | null
          q3_1_concorsi_comp_trasv?: string | null
          q3_2_onboarding?: string | null
          q3_3_apprendistato?: string | null
          q3_4_concorsi_profili_cb?: string | null
          q3_5_concorsi_dizionario?: string | null
          q3_concorsi_totali?: string | null
          q4_1_rilevazione_gap?: string | null
          q4_2_formazione_trasv?: string | null
          q4_percorsi_totali?: string | null
          q5_1_integrazione_performance?: string | null
          q5_2_incentivazione_non_mon?: string | null
          q5_3_convenzioni_universita?: string | null
          q6_1_processi_semplificati?: string | null
          q6_12_donne_agile_pct?: string | null
          q6_13_sw_hr_nuovi?: string | null
          q6_14_progressioni_oriz?: string | null
          q6_14_progressioni_vert?: string | null
          q6_15_eq_ep_under35?: string | null
          q6_16_donne_agile?: string | null
          q6_16_mobilita_out?: string | null
          q6_16_uomini_agile?: string | null
          q6_17_gg_agile_donne?: string | null
          q6_17_mobilita_in?: string | null
          q6_18_donne_dirigenti?: string | null
          q6_18_gg_totali?: string | null
          q6_19_strumenti_ict?: string | null
          q6_20_entrati_mobilita?: string | null
          q6_3_dirigente?: string | null
          q6_3_non_dirigente?: string | null
          q6_4_posti_vacanti_nondir?: string | null
          q6_4_ti_dir_donne?: string | null
          q6_4_ti_dir_uomini?: string | null
          q6_4_ti_nondir_donne?: string | null
          q6_4_ti_nondir_uomini?: string | null
          q6_5_posti_vacanti_dir?: string | null
          q6_5_td_dir_donne?: string | null
          q6_5_td_dir_uomini?: string | null
          q6_6_under35?: string | null
          q6_7_eq_ep?: string | null
          q6_8_eq_ep_under45?: string | null
          q6_9_lavoro_flessibile?: string | null
          q6_comandati_in?: string | null
          q6_comandati_out?: string | null
          q6_dip_flessibili?: string | null
          q6_entrati?: string | null
          q6_organico_medio?: string | null
          q6_pianta_organica_dir?: string | null
          q6_pianta_organica_nondir?: string | null
          q6_processi_totali?: string | null
          q6_sw_hr_totali?: string | null
          q6_tep_personale?: string | null
          q6_totale_dirigenti?: string | null
          q6_totale_donne?: string | null
          q6_usciti?: string | null
          regione?: string | null
          segmento?: string | null
          semestre?: string | null
          status?: string | null
          tipologia_amm?: string | null
        }
        Update: {
          cfiscale?: string | null
          denominazione?: string | null
          dimensione_amm?: string | null
          id?: number
          id_ente?: number | null
          q1_1_adozione_modello?: string | null
          q1_2_library_processi?: string | null
          q1_3_dizionario_competenze?: string | null
          q1_5_n_profili_definiti?: string | null
          q1_6_n_profili_competenze?: string | null
          q1_profili_totali?: string | null
          q2_1_assunti_under35?: string | null
          q2_1_assunzioni_turnover?: string | null
          q2_2_assunti_ti?: string | null
          q2_2_eq_ep_assunti?: string | null
          q2_3_assunzioni_prog?: string | null
          q2_4_assunzioni_turnover_tot?: string | null
          q2_5_assessment?: string | null
          q2_5_assunzioni_su_prog?: string | null
          q2_assunzioni_totali?: string | null
          q3_1_concorsi_comp_trasv?: string | null
          q3_2_onboarding?: string | null
          q3_3_apprendistato?: string | null
          q3_4_concorsi_profili_cb?: string | null
          q3_5_concorsi_dizionario?: string | null
          q3_concorsi_totali?: string | null
          q4_1_rilevazione_gap?: string | null
          q4_2_formazione_trasv?: string | null
          q4_percorsi_totali?: string | null
          q5_1_integrazione_performance?: string | null
          q5_2_incentivazione_non_mon?: string | null
          q5_3_convenzioni_universita?: string | null
          q6_1_processi_semplificati?: string | null
          q6_12_donne_agile_pct?: string | null
          q6_13_sw_hr_nuovi?: string | null
          q6_14_progressioni_oriz?: string | null
          q6_14_progressioni_vert?: string | null
          q6_15_eq_ep_under35?: string | null
          q6_16_donne_agile?: string | null
          q6_16_mobilita_out?: string | null
          q6_16_uomini_agile?: string | null
          q6_17_gg_agile_donne?: string | null
          q6_17_mobilita_in?: string | null
          q6_18_donne_dirigenti?: string | null
          q6_18_gg_totali?: string | null
          q6_19_strumenti_ict?: string | null
          q6_20_entrati_mobilita?: string | null
          q6_3_dirigente?: string | null
          q6_3_non_dirigente?: string | null
          q6_4_posti_vacanti_nondir?: string | null
          q6_4_ti_dir_donne?: string | null
          q6_4_ti_dir_uomini?: string | null
          q6_4_ti_nondir_donne?: string | null
          q6_4_ti_nondir_uomini?: string | null
          q6_5_posti_vacanti_dir?: string | null
          q6_5_td_dir_donne?: string | null
          q6_5_td_dir_uomini?: string | null
          q6_6_under35?: string | null
          q6_7_eq_ep?: string | null
          q6_8_eq_ep_under45?: string | null
          q6_9_lavoro_flessibile?: string | null
          q6_comandati_in?: string | null
          q6_comandati_out?: string | null
          q6_dip_flessibili?: string | null
          q6_entrati?: string | null
          q6_organico_medio?: string | null
          q6_pianta_organica_dir?: string | null
          q6_pianta_organica_nondir?: string | null
          q6_processi_totali?: string | null
          q6_sw_hr_totali?: string | null
          q6_tep_personale?: string | null
          q6_totale_dirigenti?: string | null
          q6_totale_donne?: string | null
          q6_usciti?: string | null
          regione?: string | null
          segmento?: string | null
          semestre?: string | null
          status?: string | null
          tipologia_amm?: string | null
        }
        Relationships: []
      }
      dw_lp_graduatorie: {
        Row: {
          anno: number | null
          categoria: string | null
          cfiscale_amm: string | null
          contratto: string | null
          data_approvazione_graduatoria: string | null
          data_pubblicazione_bando_gu: string | null
          denominazione: string | null
          famiglia_professionale: string | null
          id: number
          id_ente: number | null
          num_idonei: number | null
          num_idonei_assunti: number | null
          num_idonei_disponibili: number | null
          num_posti_banditi: number | null
          num_vincitori_assunti: number | null
          num_vincitori_da_assumere: number | null
          profilo: string | null
          qualifica: string | null
          stato_graduatoria: string | null
          tcp_giorni: number | null
          tipologia: string | null
        }
        Insert: {
          anno?: number | null
          categoria?: string | null
          cfiscale_amm?: string | null
          contratto?: string | null
          data_approvazione_graduatoria?: string | null
          data_pubblicazione_bando_gu?: string | null
          denominazione?: string | null
          famiglia_professionale?: string | null
          id: number
          id_ente?: number | null
          num_idonei?: number | null
          num_idonei_assunti?: number | null
          num_idonei_disponibili?: number | null
          num_posti_banditi?: number | null
          num_vincitori_assunti?: number | null
          num_vincitori_da_assumere?: number | null
          profilo?: string | null
          qualifica?: string | null
          stato_graduatoria?: string | null
          tcp_giorni?: number | null
          tipologia?: string | null
        }
        Update: {
          anno?: number | null
          categoria?: string | null
          cfiscale_amm?: string | null
          contratto?: string | null
          data_approvazione_graduatoria?: string | null
          data_pubblicazione_bando_gu?: string | null
          denominazione?: string | null
          famiglia_professionale?: string | null
          id?: number
          id_ente?: number | null
          num_idonei?: number | null
          num_idonei_assunti?: number | null
          num_idonei_disponibili?: number | null
          num_posti_banditi?: number | null
          num_vincitori_assunti?: number | null
          num_vincitori_da_assumere?: number | null
          profilo?: string | null
          qualifica?: string | null
          stato_graduatoria?: string | null
          tcp_giorni?: number | null
          tipologia?: string | null
        }
        Relationships: []
      }
      dw_minerva_assessment: {
        Row: {
          anno: number
          ciclo: string
          created_at: string
          data_fine: string | null
          data_inizio: string | null
          gap_max: number | null
          gap_medio: number | null
          id: number
          id_ente: number
          nr_competenze_valutate: number | null
          nr_dipendenti_totali: number | null
          nr_dipendenti_valutati: number | null
          nr_profili_coinvolti: number | null
          stato: string
        }
        Insert: {
          anno?: number
          ciclo?: string
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          gap_max?: number | null
          gap_medio?: number | null
          id?: number
          id_ente: number
          nr_competenze_valutate?: number | null
          nr_dipendenti_totali?: number | null
          nr_dipendenti_valutati?: number | null
          nr_profili_coinvolti?: number | null
          stato?: string
        }
        Update: {
          anno?: number
          ciclo?: string
          created_at?: string
          data_fine?: string | null
          data_inizio?: string | null
          gap_max?: number | null
          gap_medio?: number | null
          id?: number
          id_ente?: number
          nr_competenze_valutate?: number | null
          nr_dipendenti_totali?: number | null
          nr_dipendenti_valutati?: number | null
          nr_profili_coinvolti?: number | null
          stato?: string
        }
        Relationships: []
      }
      dw_modalita_lavoro: {
        Row: {
          anno: number
          categoria: string | null
          contratto: string | null
          id: number
          istituzione: number
          lavoro_agile_d: number | null
          lavoro_agile_u: number | null
          macrocat: string | null
          reperibilita_d: number | null
          reperibilita_u: number | null
          telelavoro_d: number | null
          telelavoro_u: number | null
          turnazione_d: number | null
          turnazione_u: number | null
        }
        Insert: {
          anno: number
          categoria?: string | null
          contratto?: string | null
          id?: number
          istituzione: number
          lavoro_agile_d?: number | null
          lavoro_agile_u?: number | null
          macrocat?: string | null
          reperibilita_d?: number | null
          reperibilita_u?: number | null
          telelavoro_d?: number | null
          telelavoro_u?: number | null
          turnazione_d?: number | null
          turnazione_u?: number | null
        }
        Update: {
          anno?: number
          categoria?: string | null
          contratto?: string | null
          id?: number
          istituzione?: number
          lavoro_agile_d?: number | null
          lavoro_agile_u?: number | null
          macrocat?: string | null
          reperibilita_d?: number | null
          reperibilita_u?: number | null
          telelavoro_d?: number | null
          telelavoro_u?: number | null
          turnazione_d?: number | null
          turnazione_u?: number | null
        }
        Relationships: []
      }
      dw_occupazione: {
        Row: {
          anno: number
          contratto: string | null
          id: number
          istituzione: number
          macrocat: string | null
          pt_inf50_d: number | null
          pt_inf50_u: number | null
          pt_sup50_d: number | null
          pt_sup50_u: number | null
          qualifica: string | null
          tp_donne: number | null
          tp_uomini: number | null
        }
        Insert: {
          anno: number
          contratto?: string | null
          id?: number
          istituzione: number
          macrocat?: string | null
          pt_inf50_d?: number | null
          pt_inf50_u?: number | null
          pt_sup50_d?: number | null
          pt_sup50_u?: number | null
          qualifica?: string | null
          tp_donne?: number | null
          tp_uomini?: number | null
        }
        Update: {
          anno?: number
          contratto?: string | null
          id?: number
          istituzione?: number
          macrocat?: string | null
          pt_inf50_d?: number | null
          pt_inf50_u?: number | null
          pt_sup50_d?: number | null
          pt_sup50_u?: number | null
          qualifica?: string | null
          tp_donne?: number | null
          tp_uomini?: number | null
        }
        Relationships: []
      }
      dw_passaggi_qualifica: {
        Row: {
          anno: number
          cat_arrivo: string | null
          cat_partenza: string | null
          contratto: string | null
          id: number
          istituzione: number
          numero_passaggi: number | null
          qual_arrivo: string | null
          qual_partenza: string | null
          tipo_passaggio: string | null
        }
        Insert: {
          anno: number
          cat_arrivo?: string | null
          cat_partenza?: string | null
          contratto?: string | null
          id?: number
          istituzione: number
          numero_passaggi?: number | null
          qual_arrivo?: string | null
          qual_partenza?: string | null
          tipo_passaggio?: string | null
        }
        Update: {
          anno?: number
          cat_arrivo?: string | null
          cat_partenza?: string | null
          contratto?: string | null
          id?: number
          istituzione?: number
          numero_passaggi?: number | null
          qual_arrivo?: string | null
          qual_partenza?: string | null
          tipo_passaggio?: string | null
        }
        Relationships: []
      }
      dw_profilo_di_ruolo: {
        Row: {
          ambito_ruolo: string | null
          area_contrattuale: string | null
          codice: string
          famiglia_professionale: string | null
          id_ente: number | null
          macrocategoria: string | null
          nome: string | null
        }
        Insert: {
          ambito_ruolo?: string | null
          area_contrattuale?: string | null
          codice: string
          famiglia_professionale?: string | null
          id_ente?: number | null
          macrocategoria?: string | null
          nome?: string | null
        }
        Update: {
          ambito_ruolo?: string | null
          area_contrattuale?: string | null
          codice?: string
          famiglia_professionale?: string | null
          id_ente?: number | null
          macrocategoria?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      dw_ptfp_anagrafica: {
        Row: {
          cfiscale_amm: string | null
          data_trasmissione: string | null
          denominazione: string | null
          id: number
          stato: string | null
          triennio: string | null
        }
        Insert: {
          cfiscale_amm?: string | null
          data_trasmissione?: string | null
          denominazione?: string | null
          id?: number
          stato?: string | null
          triennio?: string | null
        }
        Update: {
          cfiscale_amm?: string | null
          data_trasmissione?: string | null
          denominazione?: string | null
          id?: number
          stato?: string | null
          triennio?: string | null
        }
        Relationships: []
      }
      dw_ptfp_dotazione: {
        Row: {
          categoria_giuridica: string | null
          cfiscale_amm: string | null
          id: number
          n_teste_dotazione: number | null
          spesa_massima: number | null
          triennio: string | null
          valore_economico: number | null
        }
        Insert: {
          categoria_giuridica?: string | null
          cfiscale_amm?: string | null
          id?: number
          n_teste_dotazione?: number | null
          spesa_massima?: number | null
          triennio?: string | null
          valore_economico?: number | null
        }
        Update: {
          categoria_giuridica?: string | null
          cfiscale_amm?: string | null
          id?: number
          n_teste_dotazione?: number | null
          spesa_massima?: number | null
          triennio?: string | null
          valore_economico?: number | null
        }
        Relationships: []
      }
      dw_ptfp_reclutamento: {
        Row: {
          anno_piano: number | null
          area_giuridica: string | null
          cfiscale_amm: string | null
          id: number
          procedura_selettiva: string | null
          profilo_di_ruolo: string | null
          tipologia: string | null
          totale_impegnato: number | null
          triennio: string | null
          ula_da_assumere: number | null
          valore_economico: number | null
        }
        Insert: {
          anno_piano?: number | null
          area_giuridica?: string | null
          cfiscale_amm?: string | null
          id?: number
          procedura_selettiva?: string | null
          profilo_di_ruolo?: string | null
          tipologia?: string | null
          totale_impegnato?: number | null
          triennio?: string | null
          ula_da_assumere?: number | null
          valore_economico?: number | null
        }
        Update: {
          anno_piano?: number | null
          area_giuridica?: string | null
          cfiscale_amm?: string | null
          id?: number
          procedura_selettiva?: string | null
          profilo_di_ruolo?: string | null
          tipologia?: string | null
          totale_impegnato?: number | null
          triennio?: string | null
          ula_da_assumere?: number | null
          valore_economico?: number | null
        }
        Relationships: []
      }
      dw_qualifiche: {
        Row: {
          categoria: string | null
          cod_contratto: string | null
          descrizione: string | null
          id: number
          macrocategoria: string | null
        }
        Insert: {
          categoria?: string | null
          cod_contratto?: string | null
          descrizione?: string | null
          id?: number
          macrocategoria?: string | null
        }
        Update: {
          categoria?: string | null
          cod_contratto?: string | null
          descrizione?: string | null
          id?: number
          macrocategoria?: string | null
        }
        Relationships: []
      }
      dw_sipro_ente: {
        Row: {
          cfiscale: string | null
          codice_ipa: string | null
          comparto: string | null
          denominazione: string | null
          id: number
          tipologia: string | null
        }
        Insert: {
          cfiscale?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          denominazione?: string | null
          id?: number
          tipologia?: string | null
        }
        Update: {
          cfiscale?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          denominazione?: string | null
          id?: number
          tipologia?: string | null
        }
        Relationships: []
      }
      dw_sipro_uo: {
        Row: {
          anno: number | null
          codice_ipa_ente: string | null
          denominazione_uo: string | null
          fte_dotazione: number | null
          fte_in_servizio: number | null
          id: number
          id_uo: string | null
          id_uo_padre: string | null
          livello_gerarchico: number | null
          livello_responsabilita: string | null
        }
        Insert: {
          anno?: number | null
          codice_ipa_ente?: string | null
          denominazione_uo?: string | null
          fte_dotazione?: number | null
          fte_in_servizio?: number | null
          id?: number
          id_uo?: string | null
          id_uo_padre?: string | null
          livello_gerarchico?: number | null
          livello_responsabilita?: string | null
        }
        Update: {
          anno?: number | null
          codice_ipa_ente?: string | null
          denominazione_uo?: string | null
          fte_dotazione?: number | null
          fte_in_servizio?: number | null
          id?: number
          id_uo?: string | null
          id_uo_padre?: string | null
          livello_gerarchico?: number | null
          livello_responsabilita?: string | null
        }
        Relationships: []
      }
      dw_syllabus_catalogo: {
        Row: {
          categoria_syllabus: string | null
          competenza: string | null
          denominazione_corso: string | null
          durata_ore: number | null
          famiglia_livelli: string | null
          id: number
          id_corso: number | null
          id_programma: number | null
          livello: string | null
          programma: string | null
          tipologia: string | null
        }
        Insert: {
          categoria_syllabus?: string | null
          competenza?: string | null
          denominazione_corso?: string | null
          durata_ore?: number | null
          famiglia_livelli?: string | null
          id?: number
          id_corso?: number | null
          id_programma?: number | null
          livello?: string | null
          programma?: string | null
          tipologia?: string | null
        }
        Update: {
          categoria_syllabus?: string | null
          competenza?: string | null
          denominazione_corso?: string | null
          durata_ore?: number | null
          famiglia_livelli?: string | null
          id?: number
          id_corso?: number | null
          id_programma?: number | null
          livello?: string | null
          programma?: string | null
          tipologia?: string | null
        }
        Relationships: []
      }
      dw_syllabus_pa: {
        Row: {
          anno_partecipazione: number | null
          categoria_ipa: string | null
          cfiscale: string | null
          comparto: string | null
          denominazione: string | null
          id_pa_syllabus: number
          provincia: string | null
          regione: string | null
          tipologia: string | null
          tipologia_ipa: string | null
        }
        Insert: {
          anno_partecipazione?: number | null
          categoria_ipa?: string | null
          cfiscale?: string | null
          comparto?: string | null
          denominazione?: string | null
          id_pa_syllabus: number
          provincia?: string | null
          regione?: string | null
          tipologia?: string | null
          tipologia_ipa?: string | null
        }
        Update: {
          anno_partecipazione?: number | null
          categoria_ipa?: string | null
          cfiscale?: string | null
          comparto?: string | null
          denominazione?: string | null
          id_pa_syllabus?: number
          provincia?: string | null
          regione?: string | null
          tipologia?: string | null
          tipologia_ipa?: string | null
        }
        Relationships: []
      }
      dw_syllabus_partecipazioni: {
        Row: {
          anno: number | null
          anzianita_pa: number | null
          attivita_svolte: string | null
          durata_ore: number | null
          esito_finale: string | null
          eta: number | null
          fascia_eta: string | null
          genere: string | null
          id: number
          id_competenza: string | null
          id_corso: number | null
          id_discente: number | null
          id_pa: number | null
          livello_a: number | null
          livello_da: number | null
          qualifica: string | null
          tipo_contratto: string | null
          titolo_studio: string | null
        }
        Insert: {
          anno?: number | null
          anzianita_pa?: number | null
          attivita_svolte?: string | null
          durata_ore?: number | null
          esito_finale?: string | null
          eta?: number | null
          fascia_eta?: string | null
          genere?: string | null
          id?: number
          id_competenza?: string | null
          id_corso?: number | null
          id_discente?: number | null
          id_pa?: number | null
          livello_a?: number | null
          livello_da?: number | null
          qualifica?: string | null
          tipo_contratto?: string | null
          titolo_studio?: string | null
        }
        Update: {
          anno?: number | null
          anzianita_pa?: number | null
          attivita_svolte?: string | null
          durata_ore?: number | null
          esito_finale?: string | null
          eta?: number | null
          fascia_eta?: string | null
          genere?: string | null
          id?: number
          id_competenza?: string | null
          id_corso?: number | null
          id_discente?: number | null
          id_pa?: number | null
          livello_a?: number | null
          livello_da?: number | null
          qualifica?: string | null
          tipo_contratto?: string | null
          titolo_studio?: string | null
        }
        Relationships: []
      }
      dw_tipo_istituzione: {
        Row: {
          classe: string | null
          cod_tipo: string
          gruppo: string | null
          tipo_istituzione: string | null
        }
        Insert: {
          classe?: string | null
          cod_tipo: string
          gruppo?: string | null
          tipo_istituzione?: string | null
        }
        Update: {
          classe?: string | null
          cod_tipo?: string
          gruppo?: string | null
          tipo_istituzione?: string | null
        }
        Relationships: []
      }
      dw_titoli_studio: {
        Row: {
          anno: number
          categoria: string | null
          contratto: string | null
          donne: number | null
          id: number
          istituzione: number
          qualifica: string | null
          titolo_studio: string | null
          uomini: number | null
        }
        Insert: {
          anno: number
          categoria?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione: number
          qualifica?: string | null
          titolo_studio?: string | null
          uomini?: number | null
        }
        Update: {
          anno?: number
          categoria?: string | null
          contratto?: string | null
          donne?: number | null
          id?: number
          istituzione?: number
          qualifica?: string | null
          titolo_studio?: string | null
          uomini?: number | null
        }
        Relationships: []
      }
      dw_titolo_studio: {
        Row: {
          codice: string
          descrizione: string | null
          macro_classe: string | null
        }
        Insert: {
          codice: string
          descrizione?: string | null
          macro_classe?: string | null
        }
        Update: {
          codice?: string
          descrizione?: string | null
          macro_classe?: string | null
        }
        Relationships: []
      }
      dw_verifica_indicatori: {
        Row: {
          cgc: number | null
          cluster_iap: string | null
          cluster_isg: string | null
          cluster_tep: string | null
          cqt: number | null
          denominazione: string | null
          dpi_norm: number | null
          iac: number | null
          iap: number | null
          icec: number | null
          icpr: number | null
          icq: number | null
          ics_norm: number | null
          id_ente: number
          idc: number | null
          idla: number | null
          idp_norm: number | null
          ief_norm: number | null
          iesf: number | null
          ifm_norm: number | null
          igf: number | null
          ipd: number | null
          irg_norm: number | null
          irs: number | null
          isg: number | null
          organico_2023: number | null
          profilo: string | null
          pti: number | null
          tcf: number | null
          tcp_gg: number | null
          tcpb: number | null
          tep: number | null
          tipologia: string | null
          tsc: number | null
        }
        Insert: {
          cgc?: number | null
          cluster_iap?: string | null
          cluster_isg?: string | null
          cluster_tep?: string | null
          cqt?: number | null
          denominazione?: string | null
          dpi_norm?: number | null
          iac?: number | null
          iap?: number | null
          icec?: number | null
          icpr?: number | null
          icq?: number | null
          ics_norm?: number | null
          id_ente: number
          idc?: number | null
          idla?: number | null
          idp_norm?: number | null
          ief_norm?: number | null
          iesf?: number | null
          ifm_norm?: number | null
          igf?: number | null
          ipd?: number | null
          irg_norm?: number | null
          irs?: number | null
          isg?: number | null
          organico_2023?: number | null
          profilo?: string | null
          pti?: number | null
          tcf?: number | null
          tcp_gg?: number | null
          tcpb?: number | null
          tep?: number | null
          tipologia?: string | null
          tsc?: number | null
        }
        Update: {
          cgc?: number | null
          cluster_iap?: string | null
          cluster_isg?: string | null
          cluster_tep?: string | null
          cqt?: number | null
          denominazione?: string | null
          dpi_norm?: number | null
          iac?: number | null
          iap?: number | null
          icec?: number | null
          icpr?: number | null
          icq?: number | null
          ics_norm?: number | null
          id_ente?: number
          idc?: number | null
          idla?: number | null
          idp_norm?: number | null
          ief_norm?: number | null
          iesf?: number | null
          ifm_norm?: number | null
          igf?: number | null
          ipd?: number | null
          irg_norm?: number | null
          irs?: number | null
          isg?: number | null
          organico_2023?: number | null
          profilo?: string | null
          pti?: number | null
          tcf?: number | null
          tcp_gg?: number | null
          tcpb?: number | null
          tep?: number | null
          tipologia?: string | null
          tsc?: number | null
        }
        Relationships: []
      }
      ft_sipo_catalogo_fasi: {
        Row: {
          data_inserimento: string
          data_modifica: string | null
          descrizione: string
          fase_catalogo_id: number
          fase_digitale: number
          fase_opzionale_id: number
          lavoro_agile_id: number
          nome_fase: string
          ordinale: number
          peso_fase: number
          processo_catalogo_id: number
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          data_inserimento: string
          data_modifica?: string | null
          descrizione: string
          fase_catalogo_id?: number
          fase_digitale?: number
          fase_opzionale_id?: number
          lavoro_agile_id?: number
          nome_fase: string
          ordinale?: number
          peso_fase: number
          processo_catalogo_id: number
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          data_inserimento?: string
          data_modifica?: string | null
          descrizione?: string
          fase_catalogo_id?: number
          fase_digitale?: number
          fase_opzionale_id?: number
          lavoro_agile_id?: number
          nome_fase?: string
          ordinale?: number
          peso_fase?: number
          processo_catalogo_id?: number
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_catalogo_fasi_catalogo_fk"
            columns: ["processo_catalogo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_catalogo_processi"
            referencedColumns: ["processo_catalogo_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_fasi_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_fasi_login_fk_1"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
        ]
      }
      ft_sipo_catalogo_processi: {
        Row: {
          coinvolgimento_amministrazioni: number
          data_fine: string | null
          data_inserimento: string
          data_modifica: string | null
          denominazione: string
          descrizione: string
          descrizione_input: string
          descrizione_output: string
          ente_id: number | null
          esecuzione_processo_id: number
          giorni_previsti: number | null
          note_eliminazione: string | null
          picchi_stagionali: number
          presidio_continuativo: number
          processo_catalogo_id: number
          processo_semplificazione_id: number
          tipologia_id: number
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          coinvolgimento_amministrazioni?: number
          data_fine?: string | null
          data_inserimento: string
          data_modifica?: string | null
          denominazione: string
          descrizione: string
          descrizione_input: string
          descrizione_output: string
          ente_id?: number | null
          esecuzione_processo_id?: number
          giorni_previsti?: number | null
          note_eliminazione?: string | null
          picchi_stagionali?: number
          presidio_continuativo?: number
          processo_catalogo_id?: number
          processo_semplificazione_id: number
          tipologia_id: number
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          coinvolgimento_amministrazioni?: number
          data_fine?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          denominazione?: string
          descrizione?: string
          descrizione_input?: string
          descrizione_output?: string
          ente_id?: number | null
          esecuzione_processo_id?: number
          giorni_previsti?: number | null
          note_eliminazione?: string | null
          picchi_stagionali?: number
          presidio_continuativo?: number
          processo_catalogo_id?: number
          processo_semplificazione_id?: number
          tipologia_id?: number
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_catalogo_processi_esecuzione_fk"
            columns: ["esecuzione_processo_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_esecuzione_processo"
            referencedColumns: ["esecuzione_processo_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_processi_lk_enti"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_processi_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_processi_login_fk2"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_processi_semplificazione_fk"
            columns: ["processo_semplificazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_semplificazione_processi"
            referencedColumns: ["semplificazione_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_processi_tipologia_fk"
            columns: ["tipologia_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_tipologia_funzione"
            referencedColumns: ["tipologia_id"]
          },
        ]
      }
      ft_sipo_catalogo_vincoli_processi: {
        Row: {
          processo_catalogo_id: number
          vincoli_semplificazione_id: number
        }
        Insert: {
          processo_catalogo_id: number
          vincoli_semplificazione_id: number
        }
        Update: {
          processo_catalogo_id?: number
          vincoli_semplificazione_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_catalogo_vincoli_catalogo_fk"
            columns: ["processo_catalogo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_catalogo_processi"
            referencedColumns: ["processo_catalogo_id"]
          },
          {
            foreignKeyName: "ft_sipo_catalogo_vincoli_vincoli_fk"
            columns: ["vincoli_semplificazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_vincoli_semplificazione_processi"
            referencedColumns: ["vincolo_id"]
          },
        ]
      }
      ft_sipo_criticita_processi: {
        Row: {
          criticita_processo_id: string
          processo_id: number
        }
        Insert: {
          criticita_processo_id: string
          processo_id: number
        }
        Update: {
          criticita_processo_id?: string
          processo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_criticita_processi_criticita_fk"
            columns: ["criticita_processo_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_criticita_processi"
            referencedColumns: ["criticita_proc_id"]
          },
          {
            foreignKeyName: "ft_sipo_criticita_processi_processi_fk"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_processi"
            referencedColumns: ["processo_id"]
          },
        ]
      }
      ft_sipo_criticita_uo: {
        Row: {
          criticita_id: string
          uo_id: number
        }
        Insert: {
          criticita_id: string
          uo_id: number
        }
        Update: {
          criticita_id?: string
          uo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_criticita_uo_criticita_fk"
            columns: ["criticita_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_criticita_uo"
            referencedColumns: ["criticita_id"]
          },
          {
            foreignKeyName: "ft_sipo_criticita_uo_uo_fk"
            columns: ["uo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_uo"
            referencedColumns: ["uo_id"]
          },
        ]
      }
      ft_sipo_fasi: {
        Row: {
          data_inserimento: string
          data_modifica: string | null
          descrizione: string
          fase_digitale: number
          fase_id: number
          fase_opzionale: number
          fase_opzionale_id: number
          in_outsourcing: number
          lavoro_agile: number
          lavoro_agile_id: number
          livello_digitalizzazione_id: number | null
          nome_fase: string
          ordinale: number
          outsourcing_id: number
          parent_id: number | null
          peso_fase: number
          processo_id: number
          uo_responsabile_id: number | null
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          data_inserimento: string
          data_modifica?: string | null
          descrizione: string
          fase_digitale?: number
          fase_id?: number
          fase_opzionale?: number
          fase_opzionale_id?: number
          in_outsourcing?: number
          lavoro_agile?: number
          lavoro_agile_id?: number
          livello_digitalizzazione_id?: number | null
          nome_fase: string
          ordinale?: number
          outsourcing_id?: number
          parent_id?: number | null
          peso_fase: number
          processo_id: number
          uo_responsabile_id?: number | null
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          data_inserimento?: string
          data_modifica?: string | null
          descrizione?: string
          fase_digitale?: number
          fase_id?: number
          fase_opzionale?: number
          fase_opzionale_id?: number
          in_outsourcing?: number
          lavoro_agile?: number
          lavoro_agile_id?: number
          livello_digitalizzazione_id?: number | null
          nome_fase?: string
          ordinale?: number
          outsourcing_id?: number
          parent_id?: number | null
          peso_fase?: number
          processo_id?: number
          uo_responsabile_id?: number | null
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_fasi_digitalizzazione_fk"
            columns: ["livello_digitalizzazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_livello_digitalizzazione_fasi"
            referencedColumns: ["livello_digitalizzazione_id"]
          },
          {
            foreignKeyName: "ft_sipo_fasi_lavoro_agile_fk"
            columns: ["lavoro_agile_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_lavoro_agile_fasi"
            referencedColumns: ["lavoro_agile_id"]
          },
          {
            foreignKeyName: "ft_sipo_fasi_opzionale_fk"
            columns: ["fase_opzionale_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_opzionale_fasi"
            referencedColumns: ["fase_opzionale_id"]
          },
          {
            foreignKeyName: "ft_sipo_fasi_outsourcing_fk"
            columns: ["outsourcing_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_outsourcing_fasi"
            referencedColumns: ["outsourcing_id"]
          },
          {
            foreignKeyName: "ft_sipo_fasi_processi_fk"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_processi"
            referencedColumns: ["processo_id"]
          },
        ]
      }
      ft_sipo_fasi_uo_partecipanti: {
        Row: {
          fase_id: number
          uo_partecipante_id: number
        }
        Insert: {
          fase_id: number
          uo_partecipante_id: number
        }
        Update: {
          fase_id?: number
          uo_partecipante_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_fasi_uo_partecipanti_fasi_fk"
            columns: ["fase_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_fasi"
            referencedColumns: ["fase_id"]
          },
          {
            foreignKeyName: "ft_sipo_fasi_uo_partecipanti_uo_fk"
            columns: ["uo_partecipante_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_uo"
            referencedColumns: ["uo_id"]
          },
        ]
      }
      ft_sipo_organizzazione: {
        Row: {
          data_eliminazione: string | null
          data_inserimento: string
          data_modifica: string | null
          data_ultima_formalizzazione: string | null
          denominazione: string
          ente_id: number
          organizzazione_id: number
          stato_organizzazione_id: number
          user_eliminazione_id: number | null
          user_inserimento_id: number
          user_modifica_id: number | null
          user_ultima_formalizzazione_id: number | null
        }
        Insert: {
          data_eliminazione?: string | null
          data_inserimento: string
          data_modifica?: string | null
          data_ultima_formalizzazione?: string | null
          denominazione: string
          ente_id: number
          organizzazione_id?: number
          stato_organizzazione_id: number
          user_eliminazione_id?: number | null
          user_inserimento_id: number
          user_modifica_id?: number | null
          user_ultima_formalizzazione_id?: number | null
        }
        Update: {
          data_eliminazione?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          data_ultima_formalizzazione?: string | null
          denominazione?: string
          ente_id?: number
          organizzazione_id?: number
          stato_organizzazione_id?: number
          user_eliminazione_id?: number | null
          user_inserimento_id?: number
          user_modifica_id?: number | null
          user_ultima_formalizzazione_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_organizzazione_lk_enti_fk"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ft_sipo_organizzazione_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_organizzazione_login_fk1"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_organizzazione_login_fk2"
            columns: ["user_ultima_formalizzazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_organizzazione_login_fk3"
            columns: ["user_eliminazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_organizzazione_stato_fk"
            columns: ["stato_organizzazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_stato_organizzazione"
            referencedColumns: ["stato_organizzazione_id"]
          },
        ]
      }
      ft_sipo_processi: {
        Row: {
          catalogo_processo_id: number | null
          coinvolgimento_amministrazioni: number
          da_catalogo: number
          data_fine: string | null
          data_inserimento: string
          data_modifica: string | null
          data_pubblicazione: string | null
          data_revisione: string | null
          data_validazione: string | null
          denominazione: string
          descrizione: string
          descrizione_input: string
          descrizione_output: string
          ente_id: number
          esecuzione_processo_id: number
          giorni_previsti: number | null
          grado_rilevanza_id: number | null
          note_compilatore: string | null
          note_revisione: string | null
          obiettivo_strategico_id: number | null
          picchi_descrizione: string | null
          picchi_frequenza_id: number | null
          picchi_intensita_id: number | null
          picchi_stagionali: number
          presidio_continuativo: number
          processo_id: number
          processo_semplificazione_id: number
          stato_processo_id: number
          tempo_medio_effettivo: number | null
          tipologia_id: number
          uo_responsabile_id: number | null
          user_inserimento_id: number
          user_modifica_id: number | null
          utente_pubblicazione_id: number | null
          utente_revisione_id: number | null
          utente_validazione_id: number | null
        }
        Insert: {
          catalogo_processo_id?: number | null
          coinvolgimento_amministrazioni?: number
          da_catalogo?: number
          data_fine?: string | null
          data_inserimento: string
          data_modifica?: string | null
          data_pubblicazione?: string | null
          data_revisione?: string | null
          data_validazione?: string | null
          denominazione: string
          descrizione: string
          descrizione_input: string
          descrizione_output: string
          ente_id: number
          esecuzione_processo_id?: number
          giorni_previsti?: number | null
          grado_rilevanza_id?: number | null
          note_compilatore?: string | null
          note_revisione?: string | null
          obiettivo_strategico_id?: number | null
          picchi_descrizione?: string | null
          picchi_frequenza_id?: number | null
          picchi_intensita_id?: number | null
          picchi_stagionali?: number
          presidio_continuativo?: number
          processo_id?: number
          processo_semplificazione_id: number
          stato_processo_id?: number
          tempo_medio_effettivo?: number | null
          tipologia_id: number
          uo_responsabile_id?: number | null
          user_inserimento_id: number
          user_modifica_id?: number | null
          utente_pubblicazione_id?: number | null
          utente_revisione_id?: number | null
          utente_validazione_id?: number | null
        }
        Update: {
          catalogo_processo_id?: number | null
          coinvolgimento_amministrazioni?: number
          da_catalogo?: number
          data_fine?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          data_pubblicazione?: string | null
          data_revisione?: string | null
          data_validazione?: string | null
          denominazione?: string
          descrizione?: string
          descrizione_input?: string
          descrizione_output?: string
          ente_id?: number
          esecuzione_processo_id?: number
          giorni_previsti?: number | null
          grado_rilevanza_id?: number | null
          note_compilatore?: string | null
          note_revisione?: string | null
          obiettivo_strategico_id?: number | null
          picchi_descrizione?: string | null
          picchi_frequenza_id?: number | null
          picchi_intensita_id?: number | null
          picchi_stagionali?: number
          presidio_continuativo?: number
          processo_id?: number
          processo_semplificazione_id?: number
          stato_processo_id?: number
          tempo_medio_effettivo?: number | null
          tipologia_id?: number
          uo_responsabile_id?: number | null
          user_inserimento_id?: number
          user_modifica_id?: number | null
          utente_pubblicazione_id?: number | null
          utente_revisione_id?: number | null
          utente_validazione_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_processi_catalogo_fk"
            columns: ["catalogo_processo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_catalogo_processi"
            referencedColumns: ["processo_catalogo_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_esecuzione_fk"
            columns: ["esecuzione_processo_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_esecuzione_processo"
            referencedColumns: ["esecuzione_processo_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_lk_enti_fk"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_login_fk2"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_login_pubblicazione_fk"
            columns: ["utente_pubblicazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_login_revisione_fk"
            columns: ["utente_revisione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_login_validazione_fk"
            columns: ["utente_validazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_obiettivi_fk"
            columns: ["obiettivo_strategico_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_obiettivi_strategici_processi"
            referencedColumns: ["obiettivo_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_picchi_frequenza_fk"
            columns: ["picchi_frequenza_id"]
            isOneToOne: false
            referencedRelation: "lk_picchi_frequenza_annuale_processi"
            referencedColumns: ["picchi_frequenza_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_picchi_intensita_fk"
            columns: ["picchi_intensita_id"]
            isOneToOne: false
            referencedRelation: "lk_picchi_intensita_processi"
            referencedColumns: ["picchi_intensita_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_rilevanza_fk"
            columns: ["grado_rilevanza_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_grado_rilevanza_processi"
            referencedColumns: ["grado_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_semplificazione_fk"
            columns: ["processo_semplificazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_semplificazione_processi"
            referencedColumns: ["semplificazione_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_stato_fk"
            columns: ["stato_processo_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_stato_processi"
            referencedColumns: ["stato_processo_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_tipologia_fk"
            columns: ["tipologia_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_tipologia_funzione"
            referencedColumns: ["tipologia_id"]
          },
          {
            foreignKeyName: "ft_sipo_processi_uo_fk"
            columns: ["uo_responsabile_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_uo"
            referencedColumns: ["uo_id"]
          },
        ]
      }
      ft_sipo_profili_di_ruolo_fasi: {
        Row: {
          fase_id: number
          fte_assegnati: number
          fte_programmati: number
          id_profilo_di_ruolo: number | null
          percentuale_impegno: number
          profilo_fase_id: number
          riva_profilo_di_ruolo_id: number | null
          sipo_profilo_di_ruolo_id: number | null
        }
        Insert: {
          fase_id: number
          fte_assegnati: number
          fte_programmati: number
          id_profilo_di_ruolo?: number | null
          percentuale_impegno: number
          profilo_fase_id?: number
          riva_profilo_di_ruolo_id?: number | null
          sipo_profilo_di_ruolo_id?: number | null
        }
        Update: {
          fase_id?: number
          fte_assegnati?: number
          fte_programmati?: number
          id_profilo_di_ruolo?: number | null
          percentuale_impegno?: number
          profilo_fase_id?: number
          riva_profilo_di_ruolo_id?: number | null
          sipo_profilo_di_ruolo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_profili_di_ruolo_fasi_fasi_fk"
            columns: ["fase_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_fasi"
            referencedColumns: ["fase_id"]
          },
        ]
      }
      ft_sipo_provvedimenti_organizzazione: {
        Row: {
          data_adozione_provvedimento: string
          data_eliminazione: string | null
          data_formalizzazione: string | null
          data_modifica: string | null
          denominazione: string
          organizzazione_id: number
          provvedimenti_organizzazione_id: number
          user_eliminazione_id: number | null
          user_formalizzazione_id: number | null
          user_modifica_id: number | null
        }
        Insert: {
          data_adozione_provvedimento: string
          data_eliminazione?: string | null
          data_formalizzazione?: string | null
          data_modifica?: string | null
          denominazione: string
          organizzazione_id: number
          provvedimenti_organizzazione_id?: number
          user_eliminazione_id?: number | null
          user_formalizzazione_id?: number | null
          user_modifica_id?: number | null
        }
        Update: {
          data_adozione_provvedimento?: string
          data_eliminazione?: string | null
          data_formalizzazione?: string | null
          data_modifica?: string | null
          denominazione?: string
          organizzazione_id?: number
          provvedimenti_organizzazione_id?: number
          user_eliminazione_id?: number | null
          user_formalizzazione_id?: number | null
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_provvedimenti_organizzazione_login_fk"
            columns: ["user_formalizzazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_provvedimenti_organizzazione_login_fk2"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_provvedimenti_organizzazione_login_fk3"
            columns: ["user_eliminazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_provvedimenti_organizzazione_org_fk"
            columns: ["organizzazione_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_organizzazione"
            referencedColumns: ["organizzazione_id"]
          },
        ]
      }
      ft_sipo_uo: {
        Row: {
          data_fine_validita: string | null
          data_inserimento: string
          data_modifica: string | null
          denominazione: string
          descrizione_attivita: string | null
          ente_id: number
          livello_gerarchico: number
          livello_resp_id: number
          nome_responsabile: string | null
          organizzazione_id: number
          parent_uo_id: number | null
          risorse_dotazione: number
          risorse_servizio_tempo_det: number
          risorse_servizio_tempo_ind: number
          uo_id: number
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          data_fine_validita?: string | null
          data_inserimento: string
          data_modifica?: string | null
          denominazione: string
          descrizione_attivita?: string | null
          ente_id: number
          livello_gerarchico: number
          livello_resp_id: number
          nome_responsabile?: string | null
          organizzazione_id: number
          parent_uo_id?: number | null
          risorse_dotazione: number
          risorse_servizio_tempo_det?: number
          risorse_servizio_tempo_ind: number
          uo_id?: number
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          data_fine_validita?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          denominazione?: string
          descrizione_attivita?: string | null
          ente_id?: number
          livello_gerarchico?: number
          livello_resp_id?: number
          nome_responsabile?: string | null
          organizzazione_id?: number
          parent_uo_id?: number | null
          risorse_dotazione?: number
          risorse_servizio_tempo_det?: number
          risorse_servizio_tempo_ind?: number
          uo_id?: number
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_uo_enti_fk"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "ft_sipo_uo_livelli_resp_fk"
            columns: ["livello_resp_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_livelli_resp_uo"
            referencedColumns: ["livello_resp_id"]
          },
          {
            foreignKeyName: "ft_sipo_uo_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_uo_login_fk2"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "ft_sipo_uo_organizzazione_fk"
            columns: ["organizzazione_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_organizzazione"
            referencedColumns: ["organizzazione_id"]
          },
        ]
      }
      ft_sipo_vincoli_processi: {
        Row: {
          processo_id: number
          vincoli_semplificazione_id: number
        }
        Insert: {
          processo_id: number
          vincoli_semplificazione_id: number
        }
        Update: {
          processo_id?: number
          vincoli_semplificazione_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "ft_sipo_vincoli_processi_processi_fk"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "ft_sipo_processi"
            referencedColumns: ["processo_id"]
          },
          {
            foreignKeyName: "ft_sipo_vincoli_processi_vincoli_fk"
            columns: ["vincoli_semplificazione_id"]
            isOneToOne: false
            referencedRelation: "lk_sipo_vincoli_semplificazione_processi"
            referencedColumns: ["vincolo_id"]
          },
        ]
      }
      inpa_bandi: {
        Row: {
          anno: number
          area_funzionale: string
          bando_id: number
          benefits: string | null
          categoria_ipa: string | null
          categorie: string | null
          codice: string | null
          concorso_sezioni: string | null
          data_graduatoria: string | null
          data_pubblicazione: string
          data_scadenza: string
          descrizione: string | null
          ente_id: number
          figura_ricercata: string | null
          funzioni_lavorative: string | null
          livelli_anzianita: string | null
          num_candidature_submitted: number | null
          posti_disponibili: number
          profilo_richiesto: string
          province: string | null
          regioni: string | null
          requisiti_specifici: string | null
          settori_aziende: string | null
          stato: string
          tipi_impieghi: string | null
          tipo_procedura: string | null
          tipologia_contratto: string
          tipologia_ipa: string | null
          titolo: string
        }
        Insert: {
          anno?: number
          area_funzionale?: string
          bando_id?: number
          benefits?: string | null
          categoria_ipa?: string | null
          categorie?: string | null
          codice?: string | null
          concorso_sezioni?: string | null
          data_graduatoria?: string | null
          data_pubblicazione: string
          data_scadenza: string
          descrizione?: string | null
          ente_id: number
          figura_ricercata?: string | null
          funzioni_lavorative?: string | null
          livelli_anzianita?: string | null
          num_candidature_submitted?: number | null
          posti_disponibili?: number
          profilo_richiesto: string
          province?: string | null
          regioni?: string | null
          requisiti_specifici?: string | null
          settori_aziende?: string | null
          stato?: string
          tipi_impieghi?: string | null
          tipo_procedura?: string | null
          tipologia_contratto?: string
          tipologia_ipa?: string | null
          titolo: string
        }
        Update: {
          anno?: number
          area_funzionale?: string
          bando_id?: number
          benefits?: string | null
          categoria_ipa?: string | null
          categorie?: string | null
          codice?: string | null
          concorso_sezioni?: string | null
          data_graduatoria?: string | null
          data_pubblicazione?: string
          data_scadenza?: string
          descrizione?: string | null
          ente_id?: number
          figura_ricercata?: string | null
          funzioni_lavorative?: string | null
          livelli_anzianita?: string | null
          num_candidature_submitted?: number | null
          posti_disponibili?: number
          profilo_richiesto?: string
          province?: string | null
          regioni?: string | null
          requisiti_specifici?: string | null
          settori_aziende?: string | null
          stato?: string
          tipi_impieghi?: string | null
          tipo_procedura?: string | null
          tipologia_contratto?: string
          tipologia_ipa?: string | null
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "inpa_bandi_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      inpa_candidature: {
        Row: {
          bando_id: number
          candidatura_id: number
          data_candidatura: string
          esito: string
          eta: number
          genere: string
          punteggio: number | null
          regione_provenienza: string
          titolo_studio: string
        }
        Insert: {
          bando_id: number
          candidatura_id?: number
          data_candidatura: string
          esito?: string
          eta?: number
          genere?: string
          punteggio?: number | null
          regione_provenienza?: string
          titolo_studio?: string
        }
        Update: {
          bando_id?: number
          candidatura_id?: number
          data_candidatura?: string
          esito?: string
          eta?: number
          genere?: string
          punteggio?: number | null
          regione_provenienza?: string
          titolo_studio?: string
        }
        Relationships: [
          {
            foreignKeyName: "inpa_candidature_bando_id_fkey"
            columns: ["bando_id"]
            isOneToOne: false
            referencedRelation: "inpa_bandi"
            referencedColumns: ["bando_id"]
          },
        ]
      }
      inpa_graduatorie: {
        Row: {
          assunto: boolean
          bando_id: number
          data_assunzione: string | null
          graduatoria_id: number
          idoneo: boolean
          posizione: number
          punteggio_finale: number | null
        }
        Insert: {
          assunto?: boolean
          bando_id: number
          data_assunzione?: string | null
          graduatoria_id?: number
          idoneo?: boolean
          posizione: number
          punteggio_finale?: number | null
        }
        Update: {
          assunto?: boolean
          bando_id?: number
          data_assunzione?: string | null
          graduatoria_id?: number
          idoneo?: boolean
          posizione?: number
          punteggio_finale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inpa_graduatorie_bando_id_fkey"
            columns: ["bando_id"]
            isOneToOne: false
            referencedRelation: "inpa_bandi"
            referencedColumns: ["bando_id"]
          },
        ]
      }
      kpi_riforma_rilevazioni: {
        Row: {
          anno: number
          dimensione: string
          ente_id: number
          kpi_codice: string
          kpi_denominazione: string
          note: string | null
          rilevazione_id: number
          stato: string
          tipo_valore: string
          valore_rilevato: number | null
          valore_target: number | null
        }
        Insert: {
          anno?: number
          dimensione: string
          ente_id: number
          kpi_codice: string
          kpi_denominazione: string
          note?: string | null
          rilevazione_id?: number
          stato?: string
          tipo_valore?: string
          valore_rilevato?: number | null
          valore_target?: number | null
        }
        Update: {
          anno?: number
          dimensione?: string
          ente_id?: number
          kpi_codice?: string
          kpi_denominazione?: string
          note?: string | null
          rilevazione_id?: number
          stato?: string
          tipo_valore?: string
          valore_rilevato?: number | null
          valore_target?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_riforma_rilevazioni_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lavoro_pubblico_dotazione: {
        Row: {
          anno: number
          area_contrattuale: string
          dotazione_id: number
          dotazione_organica: number
          ente_id: number
          personale_servizio: number
        }
        Insert: {
          anno?: number
          area_contrattuale: string
          dotazione_id?: number
          dotazione_organica?: number
          ente_id: number
          personale_servizio?: number
        }
        Update: {
          anno?: number
          area_contrattuale?: string
          dotazione_id?: number
          dotazione_organica?: number
          ente_id?: number
          personale_servizio?: number
        }
        Relationships: [
          {
            foreignKeyName: "lavoro_pubblico_dotazione_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lavoro_pubblico_personale: {
        Row: {
          anno: number
          anzianita_media: number | null
          area_contrattuale: string
          ente_id: number
          fascia_eta: string
          genere: string
          numero_unita: number
          qualifica: string
          record_id: number
          regione: string
          retribuzione_media: number | null
          tipo_contratto: string
          titolo_studio: string
        }
        Insert: {
          anno?: number
          anzianita_media?: number | null
          area_contrattuale?: string
          ente_id: number
          fascia_eta?: string
          genere?: string
          numero_unita?: number
          qualifica: string
          record_id?: number
          regione?: string
          retribuzione_media?: number | null
          tipo_contratto?: string
          titolo_studio?: string
        }
        Update: {
          anno?: number
          anzianita_media?: number | null
          area_contrattuale?: string
          ente_id?: number
          fascia_eta?: string
          genere?: string
          numero_unita?: number
          qualifica?: string
          record_id?: number
          regione?: string
          retribuzione_media?: number | null
          tipo_contratto?: string
          titolo_studio?: string
        }
        Relationships: [
          {
            foreignKeyName: "lavoro_pubblico_personale_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lh_abilitazione_ambito: {
        Row: {
          data_fine_abilitazione: string
          data_inizio_abilitazione: string
          id_abilitazione_ambito: number
          id_ambito: number
          id_sottoente: number
          tipo_abilitazione: string
        }
        Insert: {
          data_fine_abilitazione?: string
          data_inizio_abilitazione?: string
          id_abilitazione_ambito?: never
          id_ambito: number
          id_sottoente: number
          tipo_abilitazione?: string
        }
        Update: {
          data_fine_abilitazione?: string
          data_inizio_abilitazione?: string
          id_abilitazione_ambito?: never
          id_ambito?: number
          id_sottoente?: number
          tipo_abilitazione?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_abilitazione_ambito_id_ambito_fkey"
            columns: ["id_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_ambito"
            referencedColumns: ["id_ambito"]
          },
          {
            foreignKeyName: "lh_abilitazione_ambito_id_sottoente_fkey"
            columns: ["id_sottoente"]
            isOneToOne: false
            referencedRelation: "lh_sottoente"
            referencedColumns: ["id_sottoente"]
          },
        ]
      }
      lh_ambito_assegnato: {
        Row: {
          f_dfp: number
          id_ambito: number
          id_ambito_assegnato: number
          id_utente: number
          stato_ambito_assegnato: string
        }
        Insert: {
          f_dfp?: number
          id_ambito: number
          id_ambito_assegnato?: never
          id_utente: number
          stato_ambito_assegnato?: string
        }
        Update: {
          f_dfp?: number
          id_ambito?: number
          id_ambito_assegnato?: never
          id_utente?: number
          stato_ambito_assegnato?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_ambito_assegnato_id_ambito_fkey"
            columns: ["id_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_ambito"
            referencedColumns: ["id_ambito"]
          },
          {
            foreignKeyName: "lh_ambito_assegnato_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_assessment: {
        Row: {
          data_creazione: string
          f_ingresso: number
          id_assessment: number
          id_livello_dichiarato: number | null
          id_percorso: number
          id_utente: number
          stato_assessment: string
          tipo_assessment: string
        }
        Insert: {
          data_creazione?: string
          f_ingresso?: number
          id_assessment?: never
          id_livello_dichiarato?: number | null
          id_percorso: number
          id_utente: number
          stato_assessment: string
          tipo_assessment: string
        }
        Update: {
          data_creazione?: string
          f_ingresso?: number
          id_assessment?: never
          id_livello_dichiarato?: number | null
          id_percorso?: number
          id_utente?: number
          stato_assessment?: string
          tipo_assessment?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_assessment_id_livello_dichiarato_fkey"
            columns: ["id_livello_dichiarato"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
          {
            foreignKeyName: "lh_assessment_id_percorso_fkey"
            columns: ["id_percorso"]
            isOneToOne: false
            referencedRelation: "lh_percorso"
            referencedColumns: ["id_percorso"]
          },
          {
            foreignKeyName: "lh_assessment_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_assessment_tentativo: {
        Row: {
          data_fine: string | null
          data_inizio: string
          f_abbandonato: number | null
          id_assessment: number
          id_assessment_tentativo: number
          stato_tentativo: string
        }
        Insert: {
          data_fine?: string | null
          data_inizio?: string
          f_abbandonato?: number | null
          id_assessment: number
          id_assessment_tentativo?: never
          stato_tentativo: string
        }
        Update: {
          data_fine?: string | null
          data_inizio?: string
          f_abbandonato?: number | null
          id_assessment?: number
          id_assessment_tentativo?: never
          stato_tentativo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_assessment_tentativo_id_assessment_fkey"
            columns: ["id_assessment"]
            isOneToOne: false
            referencedRelation: "lh_assessment"
            referencedColumns: ["id_assessment"]
          },
        ]
      }
      lh_assessment_tentativo_livello: {
        Row: {
          data_fine_test: string | null
          data_inizio_test: string
          f_abbandonato: number | null
          f_livello_superato: number | null
          f_ultimo_livello: number | null
          id_assessment_tentativo: number
          id_assessment_tentativo_livello: number
          id_livello: number
          risposte_corrette_percentuale: number | null
          soglia_superamento_percentuale: number
        }
        Insert: {
          data_fine_test?: string | null
          data_inizio_test: string
          f_abbandonato?: number | null
          f_livello_superato?: number | null
          f_ultimo_livello?: number | null
          id_assessment_tentativo: number
          id_assessment_tentativo_livello?: never
          id_livello: number
          risposte_corrette_percentuale?: number | null
          soglia_superamento_percentuale?: number
        }
        Update: {
          data_fine_test?: string | null
          data_inizio_test?: string
          f_abbandonato?: number | null
          f_livello_superato?: number | null
          f_ultimo_livello?: number | null
          id_assessment_tentativo?: number
          id_assessment_tentativo_livello?: never
          id_livello?: number
          risposte_corrette_percentuale?: number | null
          soglia_superamento_percentuale?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_assessment_tentativo_livello_id_assessment_tentativo_fkey"
            columns: ["id_assessment_tentativo"]
            isOneToOne: false
            referencedRelation: "lh_assessment_tentativo"
            referencedColumns: ["id_assessment_tentativo"]
          },
          {
            foreignKeyName: "lh_assessment_tentativo_livello_id_livello_fkey"
            columns: ["id_livello"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
        ]
      }
      lh_attivita_svolte: {
        Row: {
          attivita_svolte: string
          descrizione_attivita_svolte: string | null
          id_attivita_svolte: number
        }
        Insert: {
          attivita_svolte: string
          descrizione_attivita_svolte?: string | null
          id_attivita_svolte: number
        }
        Update: {
          attivita_svolte?: string
          descrizione_attivita_svolte?: string | null
          id_attivita_svolte?: number
        }
        Relationships: []
      }
      lh_badge: {
        Row: {
          data_ottenimento_badge: string
          f_attivo: number
          id_ambito: number
          id_badge: number
          id_competenza: number
          id_livello: number
          id_percorso: number
          id_utente: number
          stato_badge: string
          tipo_badge: string
        }
        Insert: {
          data_ottenimento_badge?: string
          f_attivo?: number
          id_ambito: number
          id_badge?: never
          id_competenza: number
          id_livello: number
          id_percorso: number
          id_utente: number
          stato_badge?: string
          tipo_badge?: string
        }
        Update: {
          data_ottenimento_badge?: string
          f_attivo?: number
          id_ambito?: number
          id_badge?: never
          id_competenza?: number
          id_livello?: number
          id_percorso?: number
          id_utente?: number
          stato_badge?: string
          tipo_badge?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_badge_id_ambito_fkey"
            columns: ["id_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_ambito"
            referencedColumns: ["id_ambito"]
          },
          {
            foreignKeyName: "lh_badge_id_competenza_fkey"
            columns: ["id_competenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_competenza"
            referencedColumns: ["id_competenza"]
          },
          {
            foreignKeyName: "lh_badge_id_livello_fkey"
            columns: ["id_livello"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
          {
            foreignKeyName: "lh_badge_id_percorso_fkey"
            columns: ["id_percorso"]
            isOneToOne: false
            referencedRelation: "lh_percorso"
            referencedColumns: ["id_percorso"]
          },
          {
            foreignKeyName: "lh_badge_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_categoria_ente: {
        Row: {
          categoria_ente: string | null
          cod_categoria_ente: string | null
          id_categoria_ente: number
          id_proprietario_dati: number
        }
        Insert: {
          categoria_ente?: string | null
          cod_categoria_ente?: string | null
          id_categoria_ente: number
          id_proprietario_dati: number
        }
        Update: {
          categoria_ente?: string | null
          cod_categoria_ente?: string | null
          id_categoria_ente?: number
          id_proprietario_dati?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_categoria_ente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
        ]
      }
      lh_cms_ambito: {
        Row: {
          ambito: string
          colore: string | null
          data_disattivazione: string | null
          descrizione: string
          f_dfp: number
          f_disattivato: number
          f_matrice: number
          id_ambito: number
          id_famiglia_livelli: number
          id_macro_ambito: number | null
          stato_matrice: string
        }
        Insert: {
          ambito: string
          colore?: string | null
          data_disattivazione?: string | null
          descrizione: string
          f_dfp?: number
          f_disattivato?: number
          f_matrice?: number
          id_ambito: number
          id_famiglia_livelli: number
          id_macro_ambito?: number | null
          stato_matrice?: string
        }
        Update: {
          ambito?: string
          colore?: string | null
          data_disattivazione?: string | null
          descrizione?: string
          f_dfp?: number
          f_disattivato?: number
          f_matrice?: number
          id_ambito?: number
          id_famiglia_livelli?: number
          id_macro_ambito?: number | null
          stato_matrice?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_ambito_id_famiglia_livelli_fkey"
            columns: ["id_famiglia_livelli"]
            isOneToOne: false
            referencedRelation: "lh_cms_famiglia_livelli"
            referencedColumns: ["id_famiglia_livelli"]
          },
          {
            foreignKeyName: "lh_cms_ambito_id_macro_ambito_fkey"
            columns: ["id_macro_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_macro_ambito"
            referencedColumns: ["id_macro_ambito"]
          },
        ]
      }
      lh_cms_area_competenza: {
        Row: {
          area_competenza: string
          descrizione: string
          f_disattivato: number
          id_ambito: number
          id_area_competenza: number
          ordine: number
        }
        Insert: {
          area_competenza: string
          descrizione: string
          f_disattivato?: number
          id_ambito: number
          id_area_competenza: number
          ordine: number
        }
        Update: {
          area_competenza?: string
          descrizione?: string
          f_disattivato?: number
          id_ambito?: number
          id_area_competenza?: number
          ordine?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_area_competenza_id_ambito_fkey"
            columns: ["id_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_ambito"
            referencedColumns: ["id_ambito"]
          },
        ]
      }
      lh_cms_competenza: {
        Row: {
          competenza: string
          descrizione: string
          f_assessment_ingresso: number
          f_assessment_uscita: number
          f_dfp: number
          f_disattivato: number
          id_competenza: number
          id_macroarea: number
          ordine: number
          soglia_superamento_percentuale: number | null
        }
        Insert: {
          competenza: string
          descrizione: string
          f_assessment_ingresso?: number
          f_assessment_uscita?: number
          f_dfp?: number
          f_disattivato?: number
          id_competenza: number
          id_macroarea: number
          ordine: number
          soglia_superamento_percentuale?: number | null
        }
        Update: {
          competenza?: string
          descrizione?: string
          f_assessment_ingresso?: number
          f_assessment_uscita?: number
          f_dfp?: number
          f_disattivato?: number
          id_competenza?: number
          id_macroarea?: number
          ordine?: number
          soglia_superamento_percentuale?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_competenza_id_macroarea_fkey"
            columns: ["id_macroarea"]
            isOneToOne: false
            referencedRelation: "lh_cms_area_competenza"
            referencedColumns: ["id_area_competenza"]
          },
        ]
      }
      lh_cms_contenuto_live: {
        Row: {
          codice_contenuto_fornitore: string
          contenuto: string | null
          data_fine_disponibilita: string | null
          data_inizio_disponibilita: string | null
          durata_contenuto_hh: number
          durata_contenuto_mm: number
          id_ambito: number
          id_contenuto: number
          id_fornitore: number
          id_metodo_assistenza: number | null
          id_stato_contenuto: number
          id_tipo_contenuto: number
          n_moduli: number | null
          titolo_contenuto: string | null
          url_contenuto: string
        }
        Insert: {
          codice_contenuto_fornitore?: string
          contenuto?: string | null
          data_fine_disponibilita?: string | null
          data_inizio_disponibilita?: string | null
          durata_contenuto_hh?: number
          durata_contenuto_mm?: number
          id_ambito: number
          id_contenuto?: never
          id_fornitore: number
          id_metodo_assistenza?: number | null
          id_stato_contenuto: number
          id_tipo_contenuto: number
          n_moduli?: number | null
          titolo_contenuto?: string | null
          url_contenuto?: string
        }
        Update: {
          codice_contenuto_fornitore?: string
          contenuto?: string | null
          data_fine_disponibilita?: string | null
          data_inizio_disponibilita?: string | null
          durata_contenuto_hh?: number
          durata_contenuto_mm?: number
          id_ambito?: number
          id_contenuto?: never
          id_fornitore?: number
          id_metodo_assistenza?: number | null
          id_stato_contenuto?: number
          id_tipo_contenuto?: number
          n_moduli?: number | null
          titolo_contenuto?: string | null
          url_contenuto?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_contenuto_live_id_ambito_fkey"
            columns: ["id_ambito"]
            isOneToOne: false
            referencedRelation: "lh_cms_ambito"
            referencedColumns: ["id_ambito"]
          },
          {
            foreignKeyName: "lh_cms_contenuto_live_id_fornitore_fkey"
            columns: ["id_fornitore"]
            isOneToOne: false
            referencedRelation: "lh_cms_fornitore"
            referencedColumns: ["id_fornitore"]
          },
          {
            foreignKeyName: "lh_cms_contenuto_live_id_metodo_assistenza_fkey"
            columns: ["id_metodo_assistenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_metodo_assistenza"
            referencedColumns: ["id_metodo_assistenza"]
          },
          {
            foreignKeyName: "lh_cms_contenuto_live_id_stato_contenuto_fkey"
            columns: ["id_stato_contenuto"]
            isOneToOne: false
            referencedRelation: "lh_cms_stato_contenuto"
            referencedColumns: ["id_stato_contenuto"]
          },
          {
            foreignKeyName: "lh_cms_contenuto_live_id_tipo_contenuto_fkey"
            columns: ["id_tipo_contenuto"]
            isOneToOne: false
            referencedRelation: "lh_cms_tipo_contenuto"
            referencedColumns: ["id_tipo_contenuto"]
          },
        ]
      }
      lh_cms_corso_live: {
        Row: {
          contenuti_e_struttura: string
          data_webinar: string | null
          f_attestato: number | null
          f_certificato: number | null
          f_webinar: number
          id_competenza: number | null
          id_contenuto: number
          id_livello_a: number | null
          id_livello_da: number | null
          n_max_iscritti: number | null
        }
        Insert: {
          contenuti_e_struttura?: string
          data_webinar?: string | null
          f_attestato?: number | null
          f_certificato?: number | null
          f_webinar?: number
          id_competenza?: number | null
          id_contenuto: number
          id_livello_a?: number | null
          id_livello_da?: number | null
          n_max_iscritti?: number | null
        }
        Update: {
          contenuti_e_struttura?: string
          data_webinar?: string | null
          f_attestato?: number | null
          f_certificato?: number | null
          f_webinar?: number
          id_competenza?: number | null
          id_contenuto?: number
          id_livello_a?: number | null
          id_livello_da?: number | null
          n_max_iscritti?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_corso_live_id_competenza_fkey"
            columns: ["id_competenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_competenza"
            referencedColumns: ["id_competenza"]
          },
          {
            foreignKeyName: "lh_cms_corso_live_id_contenuto_fkey"
            columns: ["id_contenuto"]
            isOneToOne: true
            referencedRelation: "lh_cms_contenuto_live"
            referencedColumns: ["id_contenuto"]
          },
          {
            foreignKeyName: "lh_cms_corso_live_id_livello_a_fkey"
            columns: ["id_livello_a"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
          {
            foreignKeyName: "lh_cms_corso_live_id_livello_da_fkey"
            columns: ["id_livello_da"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
        ]
      }
      lh_cms_destinatario: {
        Row: {
          destinatario: string | null
          id_destinatario: number
        }
        Insert: {
          destinatario?: string | null
          id_destinatario: number
        }
        Update: {
          destinatario?: string | null
          id_destinatario?: number
        }
        Relationships: []
      }
      lh_cms_famiglia_livelli: {
        Row: {
          descrizione: string | null
          famiglia_livelli: string
          id_famiglia_livelli: number
        }
        Insert: {
          descrizione?: string | null
          famiglia_livelli: string
          id_famiglia_livelli: number
        }
        Update: {
          descrizione?: string | null
          famiglia_livelli?: string
          id_famiglia_livelli?: number
        }
        Relationships: []
      }
      lh_cms_formato: {
        Row: {
          f_audio: number | null
          f_trascrizione: number | null
          f_video: number | null
          formato: string
          id_formato: number
        }
        Insert: {
          f_audio?: number | null
          f_trascrizione?: number | null
          f_video?: number | null
          formato: string
          id_formato: number
        }
        Update: {
          f_audio?: number | null
          f_trascrizione?: number | null
          f_video?: number | null
          formato?: string
          id_formato?: number
        }
        Relationships: []
      }
      lh_cms_fornitore: {
        Row: {
          email: string
          fornitore: string
          id_fornitore: number
          id_lms: number | null
          id_stato_fornitore: number | null
          pec: string
          piva: string
          telefono: string
        }
        Insert: {
          email: string
          fornitore: string
          id_fornitore: number
          id_lms?: number | null
          id_stato_fornitore?: number | null
          pec: string
          piva: string
          telefono: string
        }
        Update: {
          email?: string
          fornitore?: string
          id_fornitore?: number
          id_lms?: number | null
          id_stato_fornitore?: number | null
          pec?: string
          piva?: string
          telefono?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_fornitore_id_lms_fkey"
            columns: ["id_lms"]
            isOneToOne: false
            referencedRelation: "lh_cms_lms"
            referencedColumns: ["id_lms"]
          },
          {
            foreignKeyName: "lh_cms_fornitore_id_stato_fornitore_fkey"
            columns: ["id_stato_fornitore"]
            isOneToOne: false
            referencedRelation: "lh_cms_stato_fornitore"
            referencedColumns: ["id_stato_fornitore"]
          },
        ]
      }
      lh_cms_livello: {
        Row: {
          id_famiglia_livelli: number
          id_livello: number
          livello: string
          ordine: number
        }
        Insert: {
          id_famiglia_livelli: number
          id_livello: number
          livello: string
          ordine: number
        }
        Update: {
          id_famiglia_livelli?: number
          id_livello?: number
          livello?: string
          ordine?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_livello_id_famiglia_livelli_fkey"
            columns: ["id_famiglia_livelli"]
            isOneToOne: false
            referencedRelation: "lh_cms_famiglia_livelli"
            referencedColumns: ["id_famiglia_livelli"]
          },
        ]
      }
      lh_cms_lms: {
        Row: {
          codice_lms_fornitore: string
          id_lms: number
          lms: string
        }
        Insert: {
          codice_lms_fornitore: string
          id_lms: number
          lms: string
        }
        Update: {
          codice_lms_fornitore?: string
          id_lms?: number
          lms?: string
        }
        Relationships: []
      }
      lh_cms_macro_ambito: {
        Row: {
          descrizione: string
          id_macro_ambito: number
          macro_ambito: string
          ordine: number | null
        }
        Insert: {
          descrizione: string
          id_macro_ambito: number
          macro_ambito: string
          ordine?: number | null
        }
        Update: {
          descrizione?: string
          id_macro_ambito?: number
          macro_ambito?: string
          ordine?: number | null
        }
        Relationships: []
      }
      lh_cms_matrice_descrittori: {
        Row: {
          descrittore: string
          id_competenza: number
          id_livello: number
          id_matrice_descrittori: number
          numero_domande_test_descrittore: number
          numero_domande_test_descrittore_ingresso: number
          ordine: number
        }
        Insert: {
          descrittore: string
          id_competenza: number
          id_livello: number
          id_matrice_descrittori?: never
          numero_domande_test_descrittore?: number
          numero_domande_test_descrittore_ingresso?: number
          ordine?: number
        }
        Update: {
          descrittore?: string
          id_competenza?: number
          id_livello?: number
          id_matrice_descrittori?: never
          numero_domande_test_descrittore?: number
          numero_domande_test_descrittore_ingresso?: number
          ordine?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_cms_matrice_descrittori_id_competenza_fkey"
            columns: ["id_competenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_competenza"
            referencedColumns: ["id_competenza"]
          },
          {
            foreignKeyName: "lh_cms_matrice_descrittori_id_livello_fkey"
            columns: ["id_livello"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
        ]
      }
      lh_cms_metodo_assistenza: {
        Row: {
          id_metodo_assistenza: number
          metodo_assistenza: string
        }
        Insert: {
          id_metodo_assistenza: number
          metodo_assistenza: string
        }
        Update: {
          id_metodo_assistenza?: number
          metodo_assistenza?: string
        }
        Relationships: []
      }
      lh_cms_stato_contenuto: {
        Row: {
          f_visibile: number
          id_stato_contenuto: number
          stato_contenuto: string | null
        }
        Insert: {
          f_visibile?: number
          id_stato_contenuto: number
          stato_contenuto?: string | null
        }
        Update: {
          f_visibile?: number
          id_stato_contenuto?: number
          stato_contenuto?: string | null
        }
        Relationships: []
      }
      lh_cms_stato_fornitore: {
        Row: {
          id_stato_fornitore: number
          stato_fornitore: string | null
        }
        Insert: {
          id_stato_fornitore: number
          stato_fornitore?: string | null
        }
        Update: {
          id_stato_fornitore?: number
          stato_fornitore?: string | null
        }
        Relationships: []
      }
      lh_cms_tipo_contenuto: {
        Row: {
          id_tipo_contenuto: number
          tipo_contenuto: string | null
        }
        Insert: {
          id_tipo_contenuto: number
          tipo_contenuto?: string | null
        }
        Update: {
          id_tipo_contenuto?: number
          tipo_contenuto?: string | null
        }
        Relationships: []
      }
      lh_comune: {
        Row: {
          cod_istat: string | null
          denominazione_it: string | null
          id_comune: number
          id_provincia: number
        }
        Insert: {
          cod_istat?: string | null
          denominazione_it?: string | null
          id_comune: number
          id_provincia: number
        }
        Update: {
          cod_istat?: string | null
          denominazione_it?: string | null
          id_comune?: number
          id_provincia?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_comune_id_provincia_fkey"
            columns: ["id_provincia"]
            isOneToOne: false
            referencedRelation: "lh_provincia"
            referencedColumns: ["id_provincia"]
          },
        ]
      }
      lh_contenuto_conteggio: {
        Row: {
          id_contenuto: number
          numero_iscritti: number
        }
        Insert: {
          id_contenuto: number
          numero_iscritti?: number
        }
        Update: {
          id_contenuto?: number
          numero_iscritti?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_contenuto_conteggio_id_contenuto_fkey"
            columns: ["id_contenuto"]
            isOneToOne: true
            referencedRelation: "lh_cms_contenuto_live"
            referencedColumns: ["id_contenuto"]
          },
        ]
      }
      lh_ente: {
        Row: {
          acronimo_ente: string | null
          cf_ente: string | null
          cod_ipa: string
          denominazione_ente: string | null
          id_categoria_ente: number | null
          id_ente: number
          id_natura_giuridica_ente: number | null
          id_proprietario_dati: number
          id_tipologia_ente: number | null
        }
        Insert: {
          acronimo_ente?: string | null
          cf_ente?: string | null
          cod_ipa: string
          denominazione_ente?: string | null
          id_categoria_ente?: number | null
          id_ente?: never
          id_natura_giuridica_ente?: number | null
          id_proprietario_dati: number
          id_tipologia_ente?: number | null
        }
        Update: {
          acronimo_ente?: string | null
          cf_ente?: string | null
          cod_ipa?: string
          denominazione_ente?: string | null
          id_categoria_ente?: number | null
          id_ente?: never
          id_natura_giuridica_ente?: number | null
          id_proprietario_dati?: number
          id_tipologia_ente?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_ente_id_categoria_ente_fkey"
            columns: ["id_categoria_ente"]
            isOneToOne: false
            referencedRelation: "lh_categoria_ente"
            referencedColumns: ["id_categoria_ente"]
          },
          {
            foreignKeyName: "lh_ente_id_natura_giuridica_ente_fkey"
            columns: ["id_natura_giuridica_ente"]
            isOneToOne: false
            referencedRelation: "lh_natura_giuridica_ente"
            referencedColumns: ["id_natura_giuridica_ente"]
          },
          {
            foreignKeyName: "lh_ente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
          {
            foreignKeyName: "lh_ente_id_tipologia_ente_fkey"
            columns: ["id_tipologia_ente"]
            isOneToOne: false
            referencedRelation: "lh_tipologia_ente"
            referencedColumns: ["id_tipologia_ente"]
          },
        ]
      }
      lh_fact_discenti: {
        Row: {
          data_dwh: string | null
          id: number
          id_sottoente: number | null
          id_utente: number | null
          stato_utente: string | null
        }
        Insert: {
          data_dwh?: string | null
          id?: number
          id_sottoente?: number | null
          id_utente?: number | null
          stato_utente?: string | null
        }
        Update: {
          data_dwh?: string | null
          id?: number
          id_sottoente?: number | null
          id_utente?: number | null
          stato_utente?: string | null
        }
        Relationships: []
      }
      lh_fact_percorsi: {
        Row: {
          data_dwh: string | null
          id: number
          id_ambito: number | null
          id_competenza: number | null
          id_sottoente: number | null
          id_utente: number | null
          stato_percorso: string | null
        }
        Insert: {
          data_dwh?: string | null
          id?: number
          id_ambito?: number | null
          id_competenza?: number | null
          id_sottoente?: number | null
          id_utente?: number | null
          stato_percorso?: string | null
        }
        Update: {
          data_dwh?: string | null
          id?: number
          id_ambito?: number | null
          id_competenza?: number | null
          id_sottoente?: number | null
          id_utente?: number | null
          stato_percorso?: string | null
        }
        Relationships: []
      }
      lh_genere: {
        Row: {
          genere: string
          id_genere: number
        }
        Insert: {
          genere: string
          id_genere: number
        }
        Update: {
          genere?: string
          id_genere?: number
        }
        Relationships: []
      }
      lh_grado_titolo_studio: {
        Row: {
          grado_titolo_studio: string
          id_grado_titolo_studio: number
        }
        Insert: {
          grado_titolo_studio: string
          id_grado_titolo_studio: number
        }
        Update: {
          grado_titolo_studio?: string
          id_grado_titolo_studio?: number
        }
        Relationships: []
      }
      lh_gruppo: {
        Row: {
          descrizione_gruppo: string
          f_cancellazione: number
          gruppo: string
          id_gruppo: number
          id_sottoente: number
        }
        Insert: {
          descrizione_gruppo?: string
          f_cancellazione?: number
          gruppo: string
          id_gruppo?: never
          id_sottoente: number
        }
        Update: {
          descrizione_gruppo?: string
          f_cancellazione?: number
          gruppo?: string
          id_gruppo?: never
          id_sottoente?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_gruppo_id_sottoente_fkey"
            columns: ["id_sottoente"]
            isOneToOne: false
            referencedRelation: "lh_sottoente"
            referencedColumns: ["id_sottoente"]
          },
        ]
      }
      lh_iscrizione_utente_contenuto: {
        Row: {
          data_completamento: string | null
          data_iscrizione: string
          id_contenuto: number
          id_iscrizione: number
          id_utente: number
          percentuale_completamento: number
          stato_fruizione: string
        }
        Insert: {
          data_completamento?: string | null
          data_iscrizione?: string
          id_contenuto: number
          id_iscrizione?: never
          id_utente: number
          percentuale_completamento?: number
          stato_fruizione?: string
        }
        Update: {
          data_completamento?: string | null
          data_iscrizione?: string
          id_contenuto?: number
          id_iscrizione?: never
          id_utente?: number
          percentuale_completamento?: number
          stato_fruizione?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_iscrizione_utente_contenuto_id_contenuto_fkey"
            columns: ["id_contenuto"]
            isOneToOne: false
            referencedRelation: "lh_cms_contenuto_live"
            referencedColumns: ["id_contenuto"]
          },
          {
            foreignKeyName: "lh_iscrizione_utente_contenuto_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_livello_titolo_studio: {
        Row: {
          cod_livello_titolo_studio: number
          id_grado_titolo_studio: number
          id_livello_titolo_studio: number
          isced_2011: number
          livello_titolo_studio: string
        }
        Insert: {
          cod_livello_titolo_studio: number
          id_grado_titolo_studio: number
          id_livello_titolo_studio: number
          isced_2011: number
          livello_titolo_studio: string
        }
        Update: {
          cod_livello_titolo_studio?: number
          id_grado_titolo_studio?: number
          id_livello_titolo_studio?: number
          isced_2011?: number
          livello_titolo_studio?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_livello_titolo_studio_id_grado_titolo_studio_fkey"
            columns: ["id_grado_titolo_studio"]
            isOneToOne: false
            referencedRelation: "lh_grado_titolo_studio"
            referencedColumns: ["id_grado_titolo_studio"]
          },
        ]
      }
      lh_natura_giuridica_ente: {
        Row: {
          cod_natura_giuridica_ente: string | null
          id_natura_giuridica_ente: number
          id_proprietario_dati: number
          natura_giuridica_ente: string | null
        }
        Insert: {
          cod_natura_giuridica_ente?: string | null
          id_natura_giuridica_ente: number
          id_proprietario_dati: number
          natura_giuridica_ente?: string | null
        }
        Update: {
          cod_natura_giuridica_ente?: string | null
          id_natura_giuridica_ente?: number
          id_proprietario_dati?: number
          natura_giuridica_ente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_natura_giuridica_ente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
        ]
      }
      lh_percorso: {
        Row: {
          data_sospensione: string | null
          f_dfp: number
          id_competenza: number
          id_livello_attuale: number | null
          id_livello_partenza: number | null
          id_percorso: number
          id_utente: number
          stato_percorso: string
          stato_record: number
        }
        Insert: {
          data_sospensione?: string | null
          f_dfp?: number
          id_competenza: number
          id_livello_attuale?: number | null
          id_livello_partenza?: number | null
          id_percorso?: never
          id_utente: number
          stato_percorso?: string
          stato_record?: number
        }
        Update: {
          data_sospensione?: string | null
          f_dfp?: number
          id_competenza?: number
          id_livello_attuale?: number | null
          id_livello_partenza?: number | null
          id_percorso?: never
          id_utente?: number
          stato_percorso?: string
          stato_record?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_percorso_id_competenza_fkey"
            columns: ["id_competenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_competenza"
            referencedColumns: ["id_competenza"]
          },
          {
            foreignKeyName: "lh_percorso_id_livello_attuale_fkey"
            columns: ["id_livello_attuale"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
          {
            foreignKeyName: "lh_percorso_id_livello_partenza_fkey"
            columns: ["id_livello_partenza"]
            isOneToOne: false
            referencedRelation: "lh_cms_livello"
            referencedColumns: ["id_livello"]
          },
          {
            foreignKeyName: "lh_percorso_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_proprietario_dati: {
        Row: {
          id_proprietario_dati: number
          proprietario_dati: string
        }
        Insert: {
          id_proprietario_dati: number
          proprietario_dati: string
        }
        Update: {
          id_proprietario_dati?: number
          proprietario_dati?: string
        }
        Relationships: []
      }
      lh_provincia: {
        Row: {
          cod_regione: string
          denominazione: string | null
          id_provincia: number
          sigla: string | null
        }
        Insert: {
          cod_regione: string
          denominazione?: string | null
          id_provincia: number
          sigla?: string | null
        }
        Update: {
          cod_regione?: string
          denominazione?: string | null
          id_provincia?: number
          sigla?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_provincia_cod_regione_fkey"
            columns: ["cod_regione"]
            isOneToOne: false
            referencedRelation: "lh_regione"
            referencedColumns: ["cod_regione"]
          },
        ]
      }
      lh_qualifica: {
        Row: {
          id_qualifica: number
          id_qualifica_principale: number
          qualifica: string
        }
        Insert: {
          id_qualifica: number
          id_qualifica_principale: number
          qualifica: string
        }
        Update: {
          id_qualifica?: number
          id_qualifica_principale?: number
          qualifica?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_qualifica_id_qualifica_principale_fkey"
            columns: ["id_qualifica_principale"]
            isOneToOne: false
            referencedRelation: "lh_qualifica_principale"
            referencedColumns: ["id_qualifica_principale"]
          },
        ]
      }
      lh_qualifica_principale: {
        Row: {
          id_qualifica_principale: number
          qualifica_principale: string
        }
        Insert: {
          id_qualifica_principale: number
          qualifica_principale: string
        }
        Update: {
          id_qualifica_principale?: number
          qualifica_principale?: string
        }
        Relationships: []
      }
      lh_regione: {
        Row: {
          cod_regione: string
          denominazione: string | null
        }
        Insert: {
          cod_regione: string
          denominazione?: string | null
        }
        Update: {
          cod_regione?: string
          denominazione?: string | null
        }
        Relationships: []
      }
      lh_ruolo: {
        Row: {
          id_ruolo: number
          ruolo: string
        }
        Insert: {
          id_ruolo: number
          ruolo: string
        }
        Update: {
          id_ruolo?: number
          ruolo?: string
        }
        Relationships: []
      }
      lh_ruolo_amministrativo: {
        Row: {
          id_ruolo_amministrativo: number
          ordinamento: number | null
          ruolo_amministrativo: string
        }
        Insert: {
          id_ruolo_amministrativo: number
          ordinamento?: number | null
          ruolo_amministrativo: string
        }
        Update: {
          id_ruolo_amministrativo?: number
          ordinamento?: number | null
          ruolo_amministrativo?: string
        }
        Relationships: []
      }
      lh_ruolo_ente_utente: {
        Row: {
          id_ruolo: number
          id_ruolo_ente_utente: number
          id_sottoente: number
          id_utente: number
        }
        Insert: {
          id_ruolo: number
          id_ruolo_ente_utente?: never
          id_sottoente: number
          id_utente: number
        }
        Update: {
          id_ruolo?: number
          id_ruolo_ente_utente?: never
          id_sottoente?: number
          id_utente?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_ruolo_ente_utente_id_ruolo_fkey"
            columns: ["id_ruolo"]
            isOneToOne: false
            referencedRelation: "lh_ruolo"
            referencedColumns: ["id_ruolo"]
          },
          {
            foreignKeyName: "lh_ruolo_ente_utente_id_sottoente_fkey"
            columns: ["id_sottoente"]
            isOneToOne: false
            referencedRelation: "lh_sottoente"
            referencedColumns: ["id_sottoente"]
          },
          {
            foreignKeyName: "lh_ruolo_ente_utente_id_utente_fkey"
            columns: ["id_utente"]
            isOneToOne: false
            referencedRelation: "lh_utente"
            referencedColumns: ["id_utente"]
          },
        ]
      }
      lh_sede_ente: {
        Row: {
          cap: string | null
          id_comune: number
          id_sede_ente: number
          id_sottoente: number
          indirizzo: string | null
        }
        Insert: {
          cap?: string | null
          id_comune: number
          id_sede_ente?: never
          id_sottoente: number
          indirizzo?: string | null
        }
        Update: {
          cap?: string | null
          id_comune?: number
          id_sede_ente?: never
          id_sottoente?: number
          indirizzo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_sede_ente_id_comune_fkey"
            columns: ["id_comune"]
            isOneToOne: false
            referencedRelation: "lh_comune"
            referencedColumns: ["id_comune"]
          },
          {
            foreignKeyName: "lh_sede_ente_id_sottoente_fkey"
            columns: ["id_sottoente"]
            isOneToOne: false
            referencedRelation: "lh_sottoente"
            referencedColumns: ["id_sottoente"]
          },
        ]
      }
      lh_sottoente: {
        Row: {
          codice_sottoente: string | null
          data_fine: string | null
          data_inizio: string | null
          denominazione_sottoente: string | null
          f_ente: number
          id_ente: number
          id_proprietario_dati: number
          id_sottoente: number
          id_stato_ente: number
        }
        Insert: {
          codice_sottoente?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          denominazione_sottoente?: string | null
          f_ente?: number
          id_ente: number
          id_proprietario_dati: number
          id_sottoente?: never
          id_stato_ente: number
        }
        Update: {
          codice_sottoente?: string | null
          data_fine?: string | null
          data_inizio?: string | null
          denominazione_sottoente?: string | null
          f_ente?: number
          id_ente?: number
          id_proprietario_dati?: number
          id_sottoente?: never
          id_stato_ente?: number
        }
        Relationships: [
          {
            foreignKeyName: "lh_sottoente_id_ente_fkey"
            columns: ["id_ente"]
            isOneToOne: false
            referencedRelation: "lh_ente"
            referencedColumns: ["id_ente"]
          },
          {
            foreignKeyName: "lh_sottoente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
          {
            foreignKeyName: "lh_sottoente_id_stato_ente_fkey"
            columns: ["id_stato_ente"]
            isOneToOne: false
            referencedRelation: "lh_stato_ente"
            referencedColumns: ["id_stato_ente"]
          },
        ]
      }
      lh_sottoente_num_dip: {
        Row: {
          anno: number | null
          id_ente: number | null
          id_sottoente: number | null
          id_sottoente_num_dip: number
          numero_medio_dip_ae: number | null
          numero_medio_dip_istat: number | null
        }
        Insert: {
          anno?: number | null
          id_ente?: number | null
          id_sottoente?: number | null
          id_sottoente_num_dip?: never
          numero_medio_dip_ae?: number | null
          numero_medio_dip_istat?: number | null
        }
        Update: {
          anno?: number | null
          id_ente?: number | null
          id_sottoente?: number | null
          id_sottoente_num_dip?: never
          numero_medio_dip_ae?: number | null
          numero_medio_dip_istat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_sottoente_num_dip_id_ente_fkey"
            columns: ["id_ente"]
            isOneToOne: false
            referencedRelation: "lh_ente"
            referencedColumns: ["id_ente"]
          },
          {
            foreignKeyName: "lh_sottoente_num_dip_id_sottoente_fkey"
            columns: ["id_sottoente"]
            isOneToOne: false
            referencedRelation: "lh_sottoente"
            referencedColumns: ["id_sottoente"]
          },
        ]
      }
      lh_stato_ente: {
        Row: {
          id_stato_ente: number
          stato_ente: string
        }
        Insert: {
          id_stato_ente: number
          stato_ente: string
        }
        Update: {
          id_stato_ente?: number
          stato_ente?: string
        }
        Relationships: []
      }
      lh_stato_utente: {
        Row: {
          id_stato_utente: number
          stato_utente: string
        }
        Insert: {
          id_stato_utente: number
          stato_utente: string
        }
        Update: {
          id_stato_utente?: number
          stato_utente?: string
        }
        Relationships: []
      }
      lh_tipologia_contrattuale: {
        Row: {
          id_tipologia_contrattuale: number
          tipologia_contrattuale: string
        }
        Insert: {
          id_tipologia_contrattuale: number
          tipologia_contrattuale: string
        }
        Update: {
          id_tipologia_contrattuale?: number
          tipologia_contrattuale?: string
        }
        Relationships: []
      }
      lh_tipologia_ente: {
        Row: {
          id_proprietario_dati: number
          id_tipologia_ente: number
          tipologia_ente: string
        }
        Insert: {
          id_proprietario_dati: number
          id_tipologia_ente: number
          tipologia_ente: string
        }
        Update: {
          id_proprietario_dati?: number
          id_tipologia_ente?: number
          tipologia_ente?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_tipologia_ente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
        ]
      }
      lh_titolo_studio: {
        Row: {
          id_livello_titolo_studio: number
          id_titolo_studio: number
          titolo_studio: string
        }
        Insert: {
          id_livello_titolo_studio: number
          id_titolo_studio: number
          titolo_studio: string
        }
        Update: {
          id_livello_titolo_studio?: number
          id_titolo_studio?: number
          titolo_studio?: string
        }
        Relationships: [
          {
            foreignKeyName: "lh_titolo_studio_id_livello_titolo_studio_fkey"
            columns: ["id_livello_titolo_studio"]
            isOneToOne: false
            referencedRelation: "lh_livello_titolo_studio"
            referencedColumns: ["id_livello_titolo_studio"]
          },
        ]
      }
      lh_utente: {
        Row: {
          anno_ingresso_pa: number | null
          cf: string | null
          cognome: string | null
          data_nascita: string | null
          data_registrazione_utente: string | null
          data_ultimo_login: string | null
          id_attivita_svolte: number | null
          id_comune_sede_lavoro: number | null
          id_genere: number | null
          id_proprietario_dati: number
          id_qualifica: number | null
          id_ruolo_amministrativo: number | null
          id_stato_utente: number
          id_tipologia_contrattuale: number | null
          id_titolo_studio: number | null
          id_utente: number
          nome: string | null
        }
        Insert: {
          anno_ingresso_pa?: number | null
          cf?: string | null
          cognome?: string | null
          data_nascita?: string | null
          data_registrazione_utente?: string | null
          data_ultimo_login?: string | null
          id_attivita_svolte?: number | null
          id_comune_sede_lavoro?: number | null
          id_genere?: number | null
          id_proprietario_dati: number
          id_qualifica?: number | null
          id_ruolo_amministrativo?: number | null
          id_stato_utente: number
          id_tipologia_contrattuale?: number | null
          id_titolo_studio?: number | null
          id_utente?: never
          nome?: string | null
        }
        Update: {
          anno_ingresso_pa?: number | null
          cf?: string | null
          cognome?: string | null
          data_nascita?: string | null
          data_registrazione_utente?: string | null
          data_ultimo_login?: string | null
          id_attivita_svolte?: number | null
          id_comune_sede_lavoro?: number | null
          id_genere?: number | null
          id_proprietario_dati?: number
          id_qualifica?: number | null
          id_ruolo_amministrativo?: number | null
          id_stato_utente?: number
          id_tipologia_contrattuale?: number | null
          id_titolo_studio?: number | null
          id_utente?: never
          nome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lh_utente_id_attivita_svolte_fkey"
            columns: ["id_attivita_svolte"]
            isOneToOne: false
            referencedRelation: "lh_attivita_svolte"
            referencedColumns: ["id_attivita_svolte"]
          },
          {
            foreignKeyName: "lh_utente_id_comune_sede_lavoro_fkey"
            columns: ["id_comune_sede_lavoro"]
            isOneToOne: false
            referencedRelation: "lh_comune"
            referencedColumns: ["id_comune"]
          },
          {
            foreignKeyName: "lh_utente_id_genere_fkey"
            columns: ["id_genere"]
            isOneToOne: false
            referencedRelation: "lh_genere"
            referencedColumns: ["id_genere"]
          },
          {
            foreignKeyName: "lh_utente_id_proprietario_dati_fkey"
            columns: ["id_proprietario_dati"]
            isOneToOne: false
            referencedRelation: "lh_proprietario_dati"
            referencedColumns: ["id_proprietario_dati"]
          },
          {
            foreignKeyName: "lh_utente_id_qualifica_fkey"
            columns: ["id_qualifica"]
            isOneToOne: false
            referencedRelation: "lh_qualifica"
            referencedColumns: ["id_qualifica"]
          },
          {
            foreignKeyName: "lh_utente_id_ruolo_amministrativo_fkey"
            columns: ["id_ruolo_amministrativo"]
            isOneToOne: false
            referencedRelation: "lh_ruolo_amministrativo"
            referencedColumns: ["id_ruolo_amministrativo"]
          },
          {
            foreignKeyName: "lh_utente_id_stato_utente_fkey"
            columns: ["id_stato_utente"]
            isOneToOne: false
            referencedRelation: "lh_stato_utente"
            referencedColumns: ["id_stato_utente"]
          },
          {
            foreignKeyName: "lh_utente_id_tipologia_contrattuale_fkey"
            columns: ["id_tipologia_contrattuale"]
            isOneToOne: false
            referencedRelation: "lh_tipologia_contrattuale"
            referencedColumns: ["id_tipologia_contrattuale"]
          },
          {
            foreignKeyName: "lh_utente_id_titolo_studio_fkey"
            columns: ["id_titolo_studio"]
            isOneToOne: false
            referencedRelation: "lh_titolo_studio"
            referencedColumns: ["id_titolo_studio"]
          },
        ]
      }
      lk_enti: {
        Row: {
          accreditata_minerva: boolean
          citta: string | null
          codice_ente: string | null
          codice_ipa: string | null
          comparto: string | null
          data_accreditamento_minerva: string | null
          data_aggiornamento: string
          data_attivazione_profili: string | null
          denominazione: string
          dimensione_pa: string | null
          ente_id: number
          ha_profili_attivati: boolean
          provincia: string | null
          regione: string | null
          ripartizioni: string | null
          tipo: string | null
        }
        Insert: {
          accreditata_minerva?: boolean
          citta?: string | null
          codice_ente?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          data_accreditamento_minerva?: string | null
          data_aggiornamento: string
          data_attivazione_profili?: string | null
          denominazione: string
          dimensione_pa?: string | null
          ente_id?: number
          ha_profili_attivati?: boolean
          provincia?: string | null
          regione?: string | null
          ripartizioni?: string | null
          tipo?: string | null
        }
        Update: {
          accreditata_minerva?: boolean
          citta?: string | null
          codice_ente?: string | null
          codice_ipa?: string | null
          comparto?: string | null
          data_accreditamento_minerva?: string | null
          data_aggiornamento?: string
          data_attivazione_profili?: string | null
          denominazione?: string
          dimensione_pa?: string | null
          ente_id?: number
          ha_profili_attivati?: boolean
          provincia?: string | null
          regione?: string | null
          ripartizioni?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      lk_minerva_ambito_ruolo: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_famiglia_professionale: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_famiglia_professionale: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_famiglia_professionale?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_ambito_ruolo_famiglia_fk"
            columns: ["id_famiglia_professionale"]
            isOneToOne: false
            referencedRelation: "lk_minerva_famiglia_professionale"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_minerva_area_contrattuale: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_comparto?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_area_contrattuale_lk_minerva_comparto_fk"
            columns: ["id_comparto"]
            isOneToOne: false
            referencedRelation: "lk_minerva_comparto"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_minerva_comparto: {
        Row: {
          descrizione: string
          id: number
        }
        Insert: {
          descrizione: string
          id: number
        }
        Update: {
          descrizione?: string
          id?: number
        }
        Relationships: []
      }
      lk_minerva_dimensione_professionale: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_comparto?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_dimensione_professionale_lk_minerva_comparto_fk"
            columns: ["id_comparto"]
            isOneToOne: false
            referencedRelation: "lk_minerva_comparto"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_minerva_famiglia_professionale: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_comparto: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_comparto?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_famiglia_professionale_lk_minerva_comparto_fk"
            columns: ["id_comparto"]
            isOneToOne: false
            referencedRelation: "lk_minerva_comparto"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_minerva_profilo_professionale: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_area_contrattuale: number
          id_dimensione_professionale: number
          id_famiglia_professionale: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_area_contrattuale: number
          id_dimensione_professionale: number
          id_famiglia_professionale: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_area_contrattuale?: number
          id_dimensione_professionale?: number
          id_famiglia_professionale?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_profilo_professionale_dimensione_fk"
            columns: ["id_dimensione_professionale"]
            isOneToOne: false
            referencedRelation: "lk_minerva_dimensione_professionale"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lk_minerva_profilo_professionale_famiglia_fk"
            columns: ["id_famiglia_professionale"]
            isOneToOne: false
            referencedRelation: "lk_minerva_famiglia_professionale"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_minerva_profilo_ruolo: {
        Row: {
          codice: string
          descrizione: string
          id: number
          id_ambito_ruolo: number
          id_profilo_professionale: number
        }
        Insert: {
          codice: string
          descrizione: string
          id: number
          id_ambito_ruolo: number
          id_profilo_professionale: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
          id_ambito_ruolo?: number
          id_profilo_professionale?: number
        }
        Relationships: [
          {
            foreignKeyName: "lk_minerva_profilo_ruolo_ambito_fk"
            columns: ["id_ambito_ruolo"]
            isOneToOne: false
            referencedRelation: "lk_minerva_ambito_ruolo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lk_minerva_profilo_ruolo_profilo_fk"
            columns: ["id_profilo_professionale"]
            isOneToOne: false
            referencedRelation: "lk_minerva_profilo_professionale"
            referencedColumns: ["id"]
          },
        ]
      }
      lk_picchi_frequenza_annuale_processi: {
        Row: {
          frequenza: string
          picchi_frequenza_id: number
        }
        Insert: {
          frequenza: string
          picchi_frequenza_id: number
        }
        Update: {
          frequenza?: string
          picchi_frequenza_id?: number
        }
        Relationships: []
      }
      lk_picchi_intensita_processi: {
        Row: {
          intensita: string
          picchi_intensita_id: number
        }
        Insert: {
          intensita: string
          picchi_intensita_id: number
        }
        Update: {
          intensita?: string
          picchi_intensita_id?: number
        }
        Relationships: []
      }
      lk_ruoli: {
        Row: {
          abbreviazione: string | null
          nome: string | null
          ruolo_id: number
        }
        Insert: {
          abbreviazione?: string | null
          nome?: string | null
          ruolo_id: number
        }
        Update: {
          abbreviazione?: string | null
          nome?: string | null
          ruolo_id?: number
        }
        Relationships: []
      }
      lk_sipo_copertura_profili_di_ruolo: {
        Row: {
          copertura_id: number
          descrizione: string
          range_max: number
          range_min: number
        }
        Insert: {
          copertura_id: number
          descrizione: string
          range_max: number
          range_min: number
        }
        Update: {
          copertura_id?: number
          descrizione?: string
          range_max?: number
          range_min?: number
        }
        Relationships: []
      }
      lk_sipo_criticita_processi: {
        Row: {
          categoria: string
          categoria_proc_id: number
          criticita_proc_id: string
          descrizione: string
        }
        Insert: {
          categoria: string
          categoria_proc_id: number
          criticita_proc_id: string
          descrizione: string
        }
        Update: {
          categoria?: string
          categoria_proc_id?: number
          criticita_proc_id?: string
          descrizione?: string
        }
        Relationships: []
      }
      lk_sipo_criticita_uo: {
        Row: {
          categoria: string
          categoria_id: number
          criticita_id: string
          descrizione: string
        }
        Insert: {
          categoria: string
          categoria_id: number
          criticita_id: string
          descrizione: string
        }
        Update: {
          categoria?: string
          categoria_id?: number
          criticita_id?: string
          descrizione?: string
        }
        Relationships: []
      }
      lk_sipo_esecuzione_processo: {
        Row: {
          descrizione: string
          esecuzione_processo_id: number
        }
        Insert: {
          descrizione: string
          esecuzione_processo_id: number
        }
        Update: {
          descrizione?: string
          esecuzione_processo_id?: number
        }
        Relationships: []
      }
      lk_sipo_grado_rilevanza_processi: {
        Row: {
          descrizione: string | null
          dettaglio: string | null
          grado_id: number
        }
        Insert: {
          descrizione?: string | null
          dettaglio?: string | null
          grado_id: number
        }
        Update: {
          descrizione?: string | null
          dettaglio?: string | null
          grado_id?: number
        }
        Relationships: []
      }
      lk_sipo_lavoro_agile_fasi: {
        Row: {
          descrizione: string
          lavoro_agile_id: number
        }
        Insert: {
          descrizione: string
          lavoro_agile_id: number
        }
        Update: {
          descrizione?: string
          lavoro_agile_id?: number
        }
        Relationships: []
      }
      lk_sipo_livelli_resp_uo: {
        Row: {
          descrizione: string
          livello_resp_id: number
        }
        Insert: {
          descrizione: string
          livello_resp_id: number
        }
        Update: {
          descrizione?: string
          livello_resp_id?: number
        }
        Relationships: []
      }
      lk_sipo_livello_digitalizzazione_fasi: {
        Row: {
          descrizione: string | null
          livello_digitalizzazione_id: number
          valore: number | null
        }
        Insert: {
          descrizione?: string | null
          livello_digitalizzazione_id: number
          valore?: number | null
        }
        Update: {
          descrizione?: string | null
          livello_digitalizzazione_id?: number
          valore?: number | null
        }
        Relationships: []
      }
      lk_sipo_obiettivi_strategici_processi: {
        Row: {
          descrizione: string
          obiettivo_id: number
        }
        Insert: {
          descrizione: string
          obiettivo_id: number
        }
        Update: {
          descrizione?: string
          obiettivo_id?: number
        }
        Relationships: []
      }
      lk_sipo_opzionale_fasi: {
        Row: {
          descrizione: string
          fase_opzionale_id: number
        }
        Insert: {
          descrizione: string
          fase_opzionale_id: number
        }
        Update: {
          descrizione?: string
          fase_opzionale_id?: number
        }
        Relationships: []
      }
      lk_sipo_outsourcing_fasi: {
        Row: {
          descrizione: string
          outsourcing_id: number
          valore: number | null
        }
        Insert: {
          descrizione: string
          outsourcing_id: number
          valore?: number | null
        }
        Update: {
          descrizione?: string
          outsourcing_id?: number
          valore?: number | null
        }
        Relationships: []
      }
      lk_sipo_profili_di_ruolo: {
        Row: {
          codice_profilo: string | null
          comparto: string
          data_eliminazione: string | null
          data_inserimento: string
          data_modifica: string | null
          ente_id: number
          id_ambito_ruolo: number
          id_area_contrattuale: number
          id_comparto: number
          id_famiglia_professionale: number
          id_minerva_profilo_professionale: number | null
          id_sipo_profilo_professionale: number | null
          profilo_ruolo: string
          profilo_ruolo_id: number
          user_eliminazione_id: number | null
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          codice_profilo?: string | null
          comparto: string
          data_eliminazione?: string | null
          data_inserimento: string
          data_modifica?: string | null
          ente_id: number
          id_ambito_ruolo: number
          id_area_contrattuale: number
          id_comparto: number
          id_famiglia_professionale: number
          id_minerva_profilo_professionale?: number | null
          id_sipo_profilo_professionale?: number | null
          profilo_ruolo: string
          profilo_ruolo_id?: number
          user_eliminazione_id?: number | null
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          codice_profilo?: string | null
          comparto?: string
          data_eliminazione?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          ente_id?: number
          id_ambito_ruolo?: number
          id_area_contrattuale?: number
          id_comparto?: number
          id_famiglia_professionale?: number
          id_minerva_profilo_professionale?: number | null
          id_sipo_profilo_professionale?: number | null
          profilo_ruolo?: string
          profilo_ruolo_id?: number
          user_eliminazione_id?: number | null
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lk_sipo_profili_di_ruolo_lk_enti_fk"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_di_ruolo_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_di_ruolo_login_fk_1"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_di_ruolo_login_fk_2"
            columns: ["user_eliminazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
        ]
      }
      lk_sipo_profili_professionali: {
        Row: {
          area_contrattuale_id: number
          codice_profilo_professionale: string
          data_eliminazione: string | null
          data_inserimento: string
          data_modifica: string | null
          dimensione_professionale_id: number
          ente_id: number
          famiglia_professionale_id: number
          profilo_professionale: string
          profilo_professionale_id: number
          user_eliminazione_id: number | null
          user_inserimento_id: number
          user_modifica_id: number | null
        }
        Insert: {
          area_contrattuale_id: number
          codice_profilo_professionale: string
          data_eliminazione?: string | null
          data_inserimento: string
          data_modifica?: string | null
          dimensione_professionale_id: number
          ente_id: number
          famiglia_professionale_id: number
          profilo_professionale: string
          profilo_professionale_id?: number
          user_eliminazione_id?: number | null
          user_inserimento_id: number
          user_modifica_id?: number | null
        }
        Update: {
          area_contrattuale_id?: number
          codice_profilo_professionale?: string
          data_eliminazione?: string | null
          data_inserimento?: string
          data_modifica?: string | null
          dimensione_professionale_id?: number
          ente_id?: number
          famiglia_professionale_id?: number
          profilo_professionale?: string
          profilo_professionale_id?: number
          user_eliminazione_id?: number | null
          user_inserimento_id?: number
          user_modifica_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lk_sipo_profili_professionali_lk_enti_fk"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_professionali_login_fk"
            columns: ["user_inserimento_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_professionali_login_fk_1"
            columns: ["user_modifica_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
          {
            foreignKeyName: "lk_sipo_profili_professionali_login_fk_2"
            columns: ["user_eliminazione_id"]
            isOneToOne: false
            referencedRelation: "login"
            referencedColumns: ["login_id"]
          },
        ]
      }
      lk_sipo_semplificazione_processi: {
        Row: {
          descrizione: string | null
          semplificazione_id: number
        }
        Insert: {
          descrizione?: string | null
          semplificazione_id: number
        }
        Update: {
          descrizione?: string | null
          semplificazione_id?: number
        }
        Relationships: []
      }
      lk_sipo_stato_organizzazione: {
        Row: {
          descrizione: string
          stato_organizzazione_id: number
        }
        Insert: {
          descrizione: string
          stato_organizzazione_id: number
        }
        Update: {
          descrizione?: string
          stato_organizzazione_id?: number
        }
        Relationships: []
      }
      lk_sipo_stato_processi: {
        Row: {
          descrizione: string
          stato_processo_id: number
        }
        Insert: {
          descrizione: string
          stato_processo_id: number
        }
        Update: {
          descrizione?: string
          stato_processo_id?: number
        }
        Relationships: []
      }
      lk_sipo_tipologia_funzione: {
        Row: {
          funzione: string
          tipologia: string
          tipologia_id: number
        }
        Insert: {
          funzione: string
          tipologia: string
          tipologia_id: number
        }
        Update: {
          funzione?: string
          tipologia?: string
          tipologia_id?: number
        }
        Relationships: []
      }
      lk_sipo_tipologia_ruolo_processi: {
        Row: {
          tipologia: string
          tipologia_ruolo_id: number
        }
        Insert: {
          tipologia: string
          tipologia_ruolo_id: number
        }
        Update: {
          tipologia?: string
          tipologia_ruolo_id?: number
        }
        Relationships: []
      }
      lk_sipo_uo: {
        Row: {
          descrizione: string | null
          uo_id: number
        }
        Insert: {
          descrizione?: string | null
          uo_id: number
        }
        Update: {
          descrizione?: string | null
          uo_id?: number
        }
        Relationships: []
      }
      lk_sipo_vincoli_semplificazione_processi: {
        Row: {
          descrizione: string | null
          vincolo_id: number
        }
        Insert: {
          descrizione?: string | null
          vincolo_id: number
        }
        Update: {
          descrizione?: string | null
          vincolo_id?: number
        }
        Relationships: []
      }
      login: {
        Row: {
          cognome: string | null
          email: string | null
          login_id: number
          nome: string | null
          password: string | null
          ruolo_id: number | null
          username: string | null
        }
        Insert: {
          cognome?: string | null
          email?: string | null
          login_id: number
          nome?: string | null
          password?: string | null
          ruolo_id?: number | null
          username?: string | null
        }
        Update: {
          cognome?: string | null
          email?: string | null
          login_id?: number
          nome?: string | null
          password?: string | null
          ruolo_id?: number | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "login_lk_ruoli_fk"
            columns: ["ruolo_id"]
            isOneToOne: false
            referencedRelation: "lk_ruoli"
            referencedColumns: ["ruolo_id"]
          },
        ]
      }
      login_enti: {
        Row: {
          ente_id: number
          login_id: number
        }
        Insert: {
          ente_id: number
          login_id: number
        }
        Update: {
          ente_id?: number
          login_id?: number
        }
        Relationships: []
      }
      lp_graduatorie_concorsuali: {
        Row: {
          anno: number | null
          area_contrattuale: string | null
          assunti: number | null
          cf_amministrazione: string | null
          data_approvazione: string | null
          denominazione: string | null
          ente_id: number | null
          id: number
          idonei_disponibili: number | null
          idonei_totali: number | null
          profilo: string | null
          stato: string | null
        }
        Insert: {
          anno?: number | null
          area_contrattuale?: string | null
          assunti?: number | null
          cf_amministrazione?: string | null
          data_approvazione?: string | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          idonei_disponibili?: number | null
          idonei_totali?: number | null
          profilo?: string | null
          stato?: string | null
        }
        Update: {
          anno?: number | null
          area_contrattuale?: string | null
          assunti?: number | null
          cf_amministrazione?: string | null
          data_approvazione?: string | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          idonei_disponibili?: number | null
          idonei_totali?: number | null
          profilo?: string | null
          stato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_graduatorie_concorsuali_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lp_lk_ambiti: {
        Row: {
          codice: string
          descrizione: string
          id: number
        }
        Insert: {
          codice: string
          descrizione: string
          id?: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
        }
        Relationships: []
      }
      lp_lk_argomenti: {
        Row: {
          codice: string
          descrizione: string
          id: number
        }
        Insert: {
          codice: string
          descrizione: string
          id?: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
        }
        Relationships: []
      }
      lp_lk_destinatari: {
        Row: {
          codice: string
          descrizione: string
          id: number
        }
        Insert: {
          codice: string
          descrizione: string
          id?: number
        }
        Update: {
          codice?: string
          descrizione?: string
          id?: number
        }
        Relationships: []
      }
      lp_lk_tipologie_documento: {
        Row: {
          gruppo: string
          id: number
          tipologia: string
        }
        Insert: {
          gruppo: string
          id?: number
          tipologia: string
        }
        Update: {
          gruppo?: string
          id?: number
          tipologia?: string
        }
        Relationships: []
      }
      lp_pareri: {
        Row: {
          altro_identificativo: string | null
          ambito: string | null
          ambito_specifico: string | null
          argomento: string | null
          cf_amministrazione: string | null
          data_fine_pubblicazione: string | null
          data_protocollo: string | null
          data_pubblicazione: string | null
          destinatari_specifici: string | null
          gruppo_tipologia: string | null
          id: number
          id_documento: string
          oggetto: string | null
          protocollo_dfp: string | null
          pubblicazione: boolean | null
          sintesi: string | null
          tipologia_destinatari: string | null
          tipologia_documento: string | null
        }
        Insert: {
          altro_identificativo?: string | null
          ambito?: string | null
          ambito_specifico?: string | null
          argomento?: string | null
          cf_amministrazione?: string | null
          data_fine_pubblicazione?: string | null
          data_protocollo?: string | null
          data_pubblicazione?: string | null
          destinatari_specifici?: string | null
          gruppo_tipologia?: string | null
          id?: number
          id_documento: string
          oggetto?: string | null
          protocollo_dfp?: string | null
          pubblicazione?: boolean | null
          sintesi?: string | null
          tipologia_destinatari?: string | null
          tipologia_documento?: string | null
        }
        Update: {
          altro_identificativo?: string | null
          ambito?: string | null
          ambito_specifico?: string | null
          argomento?: string | null
          cf_amministrazione?: string | null
          data_fine_pubblicazione?: string | null
          data_protocollo?: string | null
          data_pubblicazione?: string | null
          destinatari_specifici?: string | null
          gruppo_tipologia?: string | null
          id?: number
          id_documento?: string
          oggetto?: string | null
          protocollo_dfp?: string | null
          pubblicazione?: boolean | null
          sintesi?: string | null
          tipologia_destinatari?: string | null
          tipologia_documento?: string | null
        }
        Relationships: []
      }
      lp_risorse_in_comune: {
        Row: {
          anno: number | null
          cf_amministrazione: string | null
          denominazione: string | null
          ente_id: number | null
          id: number
          importo_assegnato: number | null
          importo_richiesto: number | null
          popolazione: number | null
          progetto_descrizione: string | null
          progetto_titolo: string | null
          provincia: string | null
          regione: string | null
          stato: string | null
        }
        Insert: {
          anno?: number | null
          cf_amministrazione?: string | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          importo_assegnato?: number | null
          importo_richiesto?: number | null
          popolazione?: number | null
          progetto_descrizione?: string | null
          progetto_titolo?: string | null
          provincia?: string | null
          regione?: string | null
          stato?: string | null
        }
        Update: {
          anno?: number | null
          cf_amministrazione?: string | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          importo_assegnato?: number | null
          importo_richiesto?: number | null
          popolazione?: number | null
          progetto_descrizione?: string | null
          progetto_titolo?: string | null
          provincia?: string | null
          regione?: string | null
          stato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_risorse_in_comune_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lp_segretari_comunali: {
        Row: {
          anno: number | null
          cf_amministrazione: string | null
          condizione_finanziaria: string | null
          contributo_assegnato: number | null
          contributo_richiesto: number | null
          denominazione: string | null
          ente_id: number | null
          id: number
          ordine_graduatoria: number | null
          partecipazione_convenzione: number | null
          provincia: string | null
          regione: string | null
          situazione_segreteria: string | null
          tipo_comune: string | null
        }
        Insert: {
          anno?: number | null
          cf_amministrazione?: string | null
          condizione_finanziaria?: string | null
          contributo_assegnato?: number | null
          contributo_richiesto?: number | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          ordine_graduatoria?: number | null
          partecipazione_convenzione?: number | null
          provincia?: string | null
          regione?: string | null
          situazione_segreteria?: string | null
          tipo_comune?: string | null
        }
        Update: {
          anno?: number | null
          cf_amministrazione?: string | null
          condizione_finanziaria?: string | null
          contributo_assegnato?: number | null
          contributo_richiesto?: number | null
          denominazione?: string | null
          ente_id?: number | null
          id?: number
          ordine_graduatoria?: number | null
          partecipazione_convenzione?: number | null
          provincia?: string | null
          regione?: string | null
          situazione_segreteria?: string | null
          tipo_comune?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_segretari_comunali_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      lp_tfr_tfs: {
        Row: {
          anno_rilevazione: number | null
          ente_id: number | null
          id: number
          importo_accantonato: number | null
          numero_dipendenti: number | null
          regime: string | null
          tipologia_ente: string | null
        }
        Insert: {
          anno_rilevazione?: number | null
          ente_id?: number | null
          id?: number
          importo_accantonato?: number | null
          numero_dipendenti?: number | null
          regime?: string | null
          tipologia_ente?: string | null
        }
        Update: {
          anno_rilevazione?: number | null
          ente_id?: number | null
          id?: number
          importo_accantonato?: number | null
          numero_dipendenti?: number | null
          regime?: string | null
          tipologia_ente?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lp_tfr_tfs_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      minerva_adozione_profili: {
        Row: {
          codice_ipa: string | null
          data_aggiornamento: string | null
          dipendenti_con_profilo: number | null
          dipendenti_valutati: number | null
          ente_id: number
          id: number
          n_profili_professionali: number | null
          n_profili_ruolo: number | null
          totale_dipendenti: number | null
        }
        Insert: {
          codice_ipa?: string | null
          data_aggiornamento?: string | null
          dipendenti_con_profilo?: number | null
          dipendenti_valutati?: number | null
          ente_id: number
          id?: number
          n_profili_professionali?: number | null
          n_profili_ruolo?: number | null
          totale_dipendenti?: number | null
        }
        Update: {
          codice_ipa?: string | null
          data_aggiornamento?: string | null
          dipendenti_con_profilo?: number | null
          dipendenti_valutati?: number | null
          ente_id?: number
          id?: number
          n_profili_professionali?: number | null
          n_profili_ruolo?: number | null
          totale_dipendenti?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_adozione_profili_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      minerva_area_competenze: {
        Row: {
          area_id: number
          codice: string
          descrizione: string
        }
        Insert: {
          area_id?: number
          codice: string
          descrizione: string
        }
        Update: {
          area_id?: number
          codice?: string
          descrizione?: string
        }
        Relationships: []
      }
      minerva_competenze: {
        Row: {
          competenza: string
          competenza_id: number
          gap: number | null
          livello_medio_posseduto: number
          livello_richiesto: number
          profilo_id: number
          tipo: string
        }
        Insert: {
          competenza: string
          competenza_id?: number
          gap?: number | null
          livello_medio_posseduto?: number
          livello_richiesto?: number
          profilo_id: number
          tipo?: string
        }
        Update: {
          competenza?: string
          competenza_id?: number
          gap?: number | null
          livello_medio_posseduto?: number
          livello_richiesto?: number
          profilo_id?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "minerva_competenze_profilo_id_fkey"
            columns: ["profilo_id"]
            isOneToOne: false
            referencedRelation: "minerva_profili"
            referencedColumns: ["profilo_id"]
          },
        ]
      }
      minerva_competenze_catalogo: {
        Row: {
          area_id: number | null
          codice: string
          competenza_id: number
          tipo: string
          titolo: string
        }
        Insert: {
          area_id?: number | null
          codice: string
          competenza_id?: number
          tipo: string
          titolo: string
        }
        Update: {
          area_id?: number | null
          codice?: string
          competenza_id?: number
          tipo?: string
          titolo?: string
        }
        Relationships: [
          {
            foreignKeyName: "minerva_competenze_catalogo_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "minerva_area_competenze"
            referencedColumns: ["area_id"]
          },
        ]
      }
      minerva_famiglie_professionali: {
        Row: {
          comparto: string
          descrizione: string | null
          dimensione_professionale: string
          famiglia: string
          famiglia_id: number
        }
        Insert: {
          comparto?: string
          descrizione?: string | null
          dimensione_professionale: string
          famiglia: string
          famiglia_id?: number
        }
        Update: {
          comparto?: string
          descrizione?: string | null
          dimensione_professionale?: string
          famiglia?: string
          famiglia_id?: number
        }
        Relationships: []
      }
      minerva_profili: {
        Row: {
          anno: number
          area_contrattuale: string
          denominazione_profilo: string
          dotazione_organica: number
          ente_id: number
          fabbisogno_triennale: number
          famiglia_id: number
          personale_in_servizio: number
          profilo_id: number
        }
        Insert: {
          anno?: number
          area_contrattuale?: string
          denominazione_profilo: string
          dotazione_organica?: number
          ente_id: number
          fabbisogno_triennale?: number
          famiglia_id: number
          personale_in_servizio?: number
          profilo_id?: number
        }
        Update: {
          anno?: number
          area_contrattuale?: string
          denominazione_profilo?: string
          dotazione_organica?: number
          ente_id?: number
          fabbisogno_triennale?: number
          famiglia_id?: number
          personale_in_servizio?: number
          profilo_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "minerva_profili_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
          {
            foreignKeyName: "minerva_profili_famiglia_id_fkey"
            columns: ["famiglia_id"]
            isOneToOne: false
            referencedRelation: "minerva_famiglie_professionali"
            referencedColumns: ["famiglia_id"]
          },
        ]
      }
      minerva_profilo_competenze: {
        Row: {
          competenza_id: number
          id: number
          livello_richiesto: number | null
          profilo_professionale_id: number | null
          profilo_ruolo_id: number | null
        }
        Insert: {
          competenza_id: number
          id?: number
          livello_richiesto?: number | null
          profilo_professionale_id?: number | null
          profilo_ruolo_id?: number | null
        }
        Update: {
          competenza_id?: number
          id?: number
          livello_richiesto?: number | null
          profilo_professionale_id?: number | null
          profilo_ruolo_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_profilo_competenze_competenza_id_fkey"
            columns: ["competenza_id"]
            isOneToOne: false
            referencedRelation: "minerva_competenze_catalogo"
            referencedColumns: ["competenza_id"]
          },
        ]
      }
      minerva_ptfp_categorie_protette: {
        Row: {
          categoria: string
          id: number
          in_servizio: number | null
          piano_id: number
          quota_obbligo: number | null
          scopertura: number | null
        }
        Insert: {
          categoria: string
          id?: number
          in_servizio?: number | null
          piano_id: number
          quota_obbligo?: number | null
          scopertura?: number | null
        }
        Update: {
          categoria?: string
          id?: number
          in_servizio?: number | null
          piano_id?: number
          quota_obbligo?: number | null
          scopertura?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_categorie_protette_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_ptfp_cessazioni: {
        Row: {
          anno_riferimento: number
          categoria_giuridica: string
          causale: string | null
          id: number
          numero_cessazioni: number | null
          piano_id: number
          valore_economico: number | null
        }
        Insert: {
          anno_riferimento: number
          categoria_giuridica: string
          causale?: string | null
          id?: number
          numero_cessazioni?: number | null
          piano_id: number
          valore_economico?: number | null
        }
        Update: {
          anno_riferimento?: number
          categoria_giuridica?: string
          causale?: string | null
          id?: number
          numero_cessazioni?: number | null
          piano_id?: number
          valore_economico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_cessazioni_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_ptfp_dotazione: {
        Row: {
          categoria_giuridica: string
          data_provvedimento: string | null
          id: number
          num_provvedimento: string | null
          piano_id: number
          spesa_massima_potenziale: number | null
          teste_dotazione: number | null
          valore_economico: number | null
        }
        Insert: {
          categoria_giuridica: string
          data_provvedimento?: string | null
          id?: number
          num_provvedimento?: string | null
          piano_id: number
          spesa_massima_potenziale?: number | null
          teste_dotazione?: number | null
          valore_economico?: number | null
        }
        Update: {
          categoria_giuridica?: string
          data_provvedimento?: string | null
          id?: number
          num_provvedimento?: string | null
          piano_id?: number
          spesa_massima_potenziale?: number | null
          teste_dotazione?: number | null
          valore_economico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_dotazione_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_ptfp_personale: {
        Row: {
          categoria_giuridica: string
          id: number
          piano_id: number
          tipo: string
          ula: number | null
          valore_economico: number | null
        }
        Insert: {
          categoria_giuridica: string
          id?: number
          piano_id: number
          tipo: string
          ula?: number | null
          valore_economico?: number | null
        }
        Update: {
          categoria_giuridica?: string
          id?: number
          piano_id?: number
          tipo?: string
          ula?: number | null
          valore_economico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_personale_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_ptfp_piani: {
        Row: {
          cf_amministrazione: string | null
          created_at: string | null
          data_trasmissione: string | null
          denominazione_amministrazione: string | null
          ente_id: number
          piano_id: number
          stato: string | null
          triennio: string
        }
        Insert: {
          cf_amministrazione?: string | null
          created_at?: string | null
          data_trasmissione?: string | null
          denominazione_amministrazione?: string | null
          ente_id: number
          piano_id?: number
          stato?: string | null
          triennio: string
        }
        Update: {
          cf_amministrazione?: string | null
          created_at?: string | null
          data_trasmissione?: string | null
          denominazione_amministrazione?: string | null
          ente_id?: number
          piano_id?: number
          stato?: string | null
          triennio?: string
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_piani_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      minerva_ptfp_reclutamento: {
        Row: {
          anno_riferimento: number
          categoria_giuridica: string
          id: number
          modalita_reclutamento: string | null
          numero_posti: number | null
          piano_id: number
          tipo: string
          valore_economico: number | null
        }
        Insert: {
          anno_riferimento: number
          categoria_giuridica: string
          id?: number
          modalita_reclutamento?: string | null
          numero_posti?: number | null
          piano_id: number
          tipo: string
          valore_economico?: number | null
        }
        Update: {
          anno_riferimento?: number
          categoria_giuridica?: string
          id?: number
          modalita_reclutamento?: string | null
          numero_posti?: number | null
          piano_id?: number
          tipo?: string
          valore_economico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_reclutamento_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_ptfp_vacanze: {
        Row: {
          categoria_giuridica: string
          eccedenze: number | null
          facolta_assunzionale: number | null
          id: number
          piano_id: number
          vacanze_organico: number | null
        }
        Insert: {
          categoria_giuridica: string
          eccedenze?: number | null
          facolta_assunzionale?: number | null
          id?: number
          piano_id: number
          vacanze_organico?: number | null
        }
        Update: {
          categoria_giuridica?: string
          eccedenze?: number | null
          facolta_assunzionale?: number | null
          id?: number
          piano_id?: number
          vacanze_organico?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "minerva_ptfp_vacanze_piano_id_fkey"
            columns: ["piano_id"]
            isOneToOne: false
            referencedRelation: "minerva_ptfp_piani"
            referencedColumns: ["piano_id"]
          },
        ]
      }
      minerva_valutazioni: {
        Row: {
          anno: number
          copertura_competenze: number
          percentuale_formati: number
          profilo_id: number
          valutazione_id: number
          valutazione_media: number
        }
        Insert: {
          anno?: number
          copertura_competenze?: number
          percentuale_formati?: number
          profilo_id: number
          valutazione_id?: number
          valutazione_media?: number
        }
        Update: {
          anno?: number
          copertura_competenze?: number
          percentuale_formati?: number
          profilo_id?: number
          valutazione_id?: number
          valutazione_media?: number
        }
        Relationships: [
          {
            foreignKeyName: "minerva_valutazioni_profilo_id_fkey"
            columns: ["profilo_id"]
            isOneToOne: false
            referencedRelation: "minerva_profili"
            referencedColumns: ["profilo_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          ente_id: number | null
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          ente_id?: number | null
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          ente_id?: number | null
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_ente_id_fkey"
            columns: ["ente_id"]
            isOneToOne: false
            referencedRelation: "lk_enti"
            referencedColumns: ["ente_id"]
          },
        ]
      }
      sipo_audit_log: {
        Row: {
          audit_log_id: number
          correlation_id: string | null
          ente_id: number | null
          entity_id: string | null
          entity_name: string | null
          error: number | null
          new_value: string | null
          old_value: string | null
          operation: string | null
          service_name: string | null
          timestamp: string | null
          user_id: number | null
        }
        Insert: {
          audit_log_id?: number
          correlation_id?: string | null
          ente_id?: number | null
          entity_id?: string | null
          entity_name?: string | null
          error?: number | null
          new_value?: string | null
          old_value?: string | null
          operation?: string | null
          service_name?: string | null
          timestamp?: string | null
          user_id?: number | null
        }
        Update: {
          audit_log_id?: number
          correlation_id?: string | null
          ente_id?: number | null
          entity_id?: string | null
          entity_name?: string | null
          error?: number | null
          new_value?: string | null
          old_value?: string | null
          operation?: string | null
          service_name?: string | null
          timestamp?: string | null
          user_id?: number | null
        }
        Relationships: []
      }
      user_journey_likes: {
        Row: {
          created_at: string
          journey_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          journey_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          journey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_likes_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "user_journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_journey_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_step_indicators: {
        Row: {
          custom_insight: string | null
          id: string
          indicator_id: string
          step_id: string
        }
        Insert: {
          custom_insight?: string | null
          id?: string
          indicator_id: string
          step_id: string
        }
        Update: {
          custom_insight?: string | null
          id?: string
          indicator_id?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_step_indicators_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "user_journey_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journey_steps: {
        Row: {
          description: string | null
          id: string
          insight_text: string | null
          insight_type:
            | Database["public"]["Enums"]["journey_insight_type"]
            | null
          journey_id: string
          step_order: number
          title: string
        }
        Insert: {
          description?: string | null
          id?: string
          insight_text?: string | null
          insight_type?:
            | Database["public"]["Enums"]["journey_insight_type"]
            | null
          journey_id: string
          step_order?: number
          title: string
        }
        Update: {
          description?: string | null
          id?: string
          insight_text?: string | null
          insight_type?:
            | Database["public"]["Enums"]["journey_insight_type"]
            | null
          journey_id?: string
          step_order?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_journey_steps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "user_journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_journeys: {
        Row: {
          author_id: string | null
          category: Database["public"]["Enums"]["journey_category"]
          created_at: string
          icon: string | null
          id: string
          is_public: boolean
          question: string | null
          subtitle: string | null
          title: string
          updated_at: string
          usage_count: number
        }
        Insert: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["journey_category"]
          created_at?: string
          icon?: string | null
          id?: string
          is_public?: boolean
          question?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
          usage_count?: number
        }
        Update: {
          author_id?: string | null
          category?: Database["public"]["Enums"]["journey_category"]
          created_at?: string
          icon?: string | null
          id?: string
          is_public?: boolean
          question?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
          usage_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_journeys_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_journey_usage: {
        Args: { p_journey_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "dfp" | "ente_hr"
      journey_category: "attention" | "explore" | "plan"
      journey_insight_type: "success" | "warning" | "danger" | "info"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["dfp", "ente_hr"],
      journey_category: ["attention", "explore", "plan"],
      journey_insight_type: ["success", "warning", "danger", "info"],
    },
  },
} as const
