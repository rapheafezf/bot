"""
Script d'initialisation et d'amorçage réaliste pour Cadran Agent.
Prépare la première mission d'exemple 'Hôtels en Occitanie' avec fiches et plan.
"""

import os
import sys
import json
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from desktop_app.engine.database import init_db, get_connection

def seed_database():
    init_db()
    conn = get_connection()
    cur = conn.cursor()

    # Vérifie si une mission existe déjà
    cur.execute("SELECT COUNT(*) FROM missions")
    if cur.fetchone()[0] > 0:
        conn.close()
        return

    mission_id = "mis_init_occitanie"
    prompt = "Trouve 20 hôtels en Occitanie dont le site pourrait être amélioré et prépare un tableau de prospects."
    now = datetime.now().isoformat()

    cur.execute("""
    INSERT INTO missions (id, title, user_prompt, status, permission_mode, created_at, updated_at, result_summary, steps_count)
    VALUES (?, ?, ?, 'waiting_validation', 'assistance', ?, ?, ?, 6)
    """, (
        mission_id,
        "Prospection 20 hôtels en Occitanie & audit web",
        prompt,
        now,
        now,
        "Recherche et audit web terminés. 20 fiches prospects enregistrées dans SQLite et exportées en CSV. Une proposition d'email d'approche est en attente de validation humaine."
    ))

    # Étapes de la mission
    steps = [
        ("stp_1", 1, "Recherche web ciblée sur les hôtels indépendants en Occitanie", "browser_search", {"query": "hôtels indépendants Occitanie"}, "completed", "24 établissements indépendants identifiés en Occitanie avec sites publics accessibles."),
        ("stp_2", 2, "Analyse technique et ergonomique des sites web des hôtels", "browser_fetch_page", {"url": "https://www.occitanie-tourisme.com"}, "completed", "5 sites de référence inspectés : relevé des faiblesses mobiles et réservation."),
        ("stp_3", 3, "Collecte structurée et déduplication de 20 fiches prospects", "prospect_collect", {"region": "Occitanie", "target": 20}, "completed", "20 fiches prospects collectées, dédupliquées et enregistrées dans la base SQLite locale."),
        ("stp_4", 4, "Export du tableau des prospects au format CSV", "file_export_csv", {"filename": "prospects_hotels_occitanie.csv"}, "completed", "Fichier CSV généré avec succès dans 'workspace_cadran/prospects_hotels_occitanie.csv'."),
        ("stp_5", 5, "Préparation d'une proposition d'email personnalisé d'audit", "email_draft_create", {"template": "audit_technique"}, "completed", "Brouillon d'email d'approche rédigé avec personnalisation selon les observations techniques."),
        ("stp_6", 6, "Mise en attente pour validation humaine avant tout envoi d'email", "email_send", {"require_validation": True}, "waiting_approval", None)
    ]

    for sid, order, desc, tool, params, status, proof in steps:
        cur.execute("""
        INSERT INTO mission_steps (id, mission_id, step_order, description, tool_name, parameters_json, status, proof, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (sid, mission_id, order, desc, tool, json.dumps(params), status, proof, now))

    # Validation en attente
    cur.execute("""
    INSERT INTO validations (id, mission_id, step_id, type, title, payload_json, status, created_at)
    VALUES (?, ?, 'stp_6', 'email_send', ?, ?, 'pending', ?)
    """, (
        "val_demo_1",
        mission_id,
        "Validation d'envoi d'email : Proposition d'audit pour l'Hôtel Saint-Sernin",
        json.dumps({
            "account": "SMTP Personnel (contact@cadran-agent.local)",
            "to_email": "contact@hotel-stsernin.com",
            "subject": "Optimisation des réservations directes sur mobile - Hôtel Saint-Sernin",
            "body": "Madame, Monsieur,\n\nEn consultant le site web de l'Hôtel Saint-Sernin, nous avons relevé que l'ergonomie mobile présente plusieurs blocages empêchant la réservation directe sur smartphone.\n\nSeriez-vous intéressé par un court aperçu des optimisations possibles sans refonte complète ?\n\nBien cordialement,\nL'équipe Cadran Agent",
            "attachments": ["audit_ergonomie_mobile.pdf"]
        }),
        now
    ))

    # Événements de logs
    logs = [
        ("info", "Mission initialisée en mode Assistance : planification pas à pas."),
        ("tool_call", "Appel de l'outil browser_search pour les hôtels en Occitanie."),
        ("tool_result", "Recherche web terminée avec succès : 24 domaines répertoriés."),
        ("tool_call", "Appel de l'outil prospect_collect : qualification de 20 fiches vérifiées."),
        ("tool_result", "20 prospects enregistrés dans SQLite."),
        ("tool_call", "Appel de l'outil file_export_csv vers prospects_hotels_occitanie.csv."),
        ("tool_result", "Export CSV généré (workspace_cadran/prospects_hotels_occitanie.csv)."),
        ("approval_request", "Action critique 'email_send' suspendue : en attente de validation humaine explicite.")
    ]

    for lvl, msg in logs:
        cur.execute("""
        INSERT INTO action_logs (mission_id, level, message, created_at)
        VALUES (?, ?, ?, ?)
        """, (mission_id, lvl, msg, now))

    # Insertion des 20 prospects réels d'Occitanie
    hotels = [
        ("Hôtel Saint-Sernin", "Toulouse", "https://www.hotel-stsernin.com", "Site vieillissant, absence de réservation directe sur mobile, temps de chargement élevé.", "contact@hotel-stsernin.com"),
        ("Domaine de Verchant", "Castelnau-le-Lez", "https://www.domainedeverchant.com", "Très beau cadre, mais formulaire de contact difficile à remplir sur mobile.", ""),
        ("Hôtel d'Aragon", "Montpellier", "https://www.hotel-aragon.com", "Pas de version multilingue optimisée, certificat SSL valide mais images non compressées.", "reception@hotel-aragon.com"),
        ("Auberge des Lices", "Carcassonne", "https://www.aubergedeslices.fr", "Carte de restaurant au format PDF non responsive, pas de widget de réservation directe.", "contact@aubergedeslices.fr"),
        ("Hôtel Cheval Blanc", "Nîmes", "https://www.chevalblanc-nimes.com", "Design daté des années 2015, boutons d'appels à l'action non contrastés.", "info@chevalblanc-nimes.com"),
        ("Grand Hôtel Moderne", "Lourdes", "https://www.grandhotelmoderne.com", "Lenteur serveur au premier affichage (TTFB > 1.8s), pas de protocole HTTP/2.", ""),
        ("Hôtel Les Deux Frères", "Roquefort", "https://www.deux-freres-roquefort.fr", "Site non sécurisé en HTTPS sur certaines pages internes, absence de formulaire devis.", "reservation@deux-freres.fr"),
        ("Manoir de l'Astragale", "Albi", "https://www.manoir-astragale-albi.fr", "Photos non optimisées pour le référencement naturel (balises alt vides).", "bonjour@manoir-astragale.fr"),
        ("Hôtel Le Donjon", "Carcassonne", "https://www.hotel-ledonjon.fr", "Bandeau de cookies masquant la moitié de la page d'accueil sur petit écran.", "contact@hotel-ledonjon.fr"),
        ("La Cour des Consuls", "Toulouse", "https://www.lacourdesconsuls.com", "Module de réservation externe avec rupture graphique et perte de tracking.", ""),
        ("Hôtel Baudon de Mauny", "Montpellier", "https://www.baudondemauny.com", "Site minimaliste mais sans tarifs visibles en direct.", "reservation@baudondemauny.com"),
        ("Le Clos des Oliviers", "Mauguio", "https://www.clos-des-oliviers.fr", "Numéro de téléphone non cliquable depuis un smartphone (pas de balise tel:).", "info@clos-des-oliviers.fr"),
        ("Hôtel du Parc", "Mende", "https://www.hotel-du-parc-mende.fr", "Absence de description des chambres et pas de calendrier des disponibilités.", "contact@parc-mende.fr"),
        ("Auberge de la Truffe", "Cahors", "https://www.auberge-truffe-cahors.com", "Site non adapté aux écrans larges (largeur fixe 960px bloquée).", ""),
        ("Hôtel Albar Hotel", "Nîmes", "https://www.albar-nimes.com", "Temps de chargement des polices web supérieur à 2 secondes.", "resa@albar-nimes.com"),
        ("Hôtel de la Cité", "Carcassonne", "https://www.hoteldelacite.com", "Visibilité SEO moyenne sur les requêtes locales en anglais et espagnol.", "citereception@citehotel.com"),
        ("Hôtel Victoria", "Tarbes", "https://www.hotel-victoria-tarbes.fr", "Design monochrome sans appel à l'action pour réserver.", "contact@victoria-tarbes.fr"),
        ("Château de Flaugergues", "Montpellier", "https://www.flaugergues.com", "Section hébergement peu visible depuis la page principale du domaine.", "reception@flaugergues.com"),
        ("Hôtel des Beaux Arts", "Toulouse", "https://www.hotel-des-beaux-arts.fr", "Formulaire de contact sans captcha ni confirmation immédiate.", ""),
        ("Le Mas de Boudan", "Nîmes", "https://www.mas-de-boudan.com", "Bandeau d'information covid obsolète toujours affiché en en-tête.", "direction@mas-de-boudan.com")
    ]

    for idx, (name, city, site, obs, email) in enumerate(hotels, start=1):
        cur.execute("""
        INSERT INTO prospects 
        (id, mission_id, company_name, website, city, activity, email, source_url, collected_at, observations, hypotheses, missing_info, proposal_email_subject, proposal_email_body, status, is_excluded)
        VALUES (?, ?, ?, ?, ?, 'Hôtellerie de charme', ?, ?, ?, ?, ?, ?, ?, ?, 'new', 0)
        """, (
            f"prosp_{idx}",
            mission_id,
            name,
            site,
            city,
            email if email else None,
            site,
            now,
            obs,
            "Un rafraîchissement mobile et la réservation directe augmenteraient les marges directes.",
            "Coordonnées directes vérifiées" if email else "Email direct non mentionné publiquement (formulaire de contact)",
            f"Optimisation du site et réservations directes - {name}",
            f"Bonjour,\n\nEn consultant le site web de {name}, nous avons noté que l'ergonomie mobile pouvait être améliorée :\n- {obs}\n\nSeriez-vous ouvert à un audit technique offert ?",
        ))

    # Écriture du fichier CSV dans workspace_cadran
    workspace_dir = os.path.join(ROOT_DIR, "workspace_cadran")
    os.makedirs(workspace_dir, exist_ok=True)
    csv_path = os.path.join(workspace_dir, "prospects_hotels_occitanie.csv")
    with open(csv_path, "w", encoding="utf-8-sig") as f:
        f.write("Nom;Ville;Activité;Site Web;Email Public;Observations;Hypothèses;Informations Manquantes\n")
        for name, city, site, obs, email in hotels:
            f.write(f"{name};{city};Hôtellerie de charme;{site};{email};{obs};Amélioration UX et résa directe;{'' if email else 'Formulaire seul'}\n")

    conn.commit()
    conn.close()
    print("Seed Cadran Agent complété avec succès.")

if __name__ == "__main__":
    seed_database()
