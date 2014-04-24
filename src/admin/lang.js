angular.module('myApp').run(function (gettextCatalog) {
    gettextCatalog.currentLanguage = 'fr';
    gettextCatalog.debug = true;
});
/* THIS IS THE angular-translation version
angular.module('myApp').config(['$translateProvider',
	function($translateProvider){
		$translateProvider.translations('fr', {
			ACTION_DELETE: "Supprimer",
			ACTION_DELETE_MAP: "Supprimer cette carte",
			ACTION_SAVE_MAP: "Enregistrer cette carte",
			ACTIONS: 'Actions',
			ADD_FORM: "Formulaire d'ajout",
			ADDRESS: 'Adresse',
			ADMIN_PAGE_TITLE: 'Carte economique de Nantes',
			ALL_MAPS: 'Toutes les cartes',
			APP_TITLE: 'Nantes Métropole Développement',
			BUTTON_ADD_LABEL: 'Ajouter',
			BUTTON_LOCATE_HERE: 'Localiser ici',
			CONTROLS: 'Contrôles',
			CONTROLS_HELP: "Ce formulaire permet de choisir d'afficher ou de cacher les éléments de contrôle de la carte.",
			CONTROL_MINIMAP: 'Mini carte (bas droite)',
			CONTROL_LAYER: 'Contrôle des couches (haut droit)',
			CONTROL_ZOOM: 'Zoom (haut gauche)',
			COPY_PASTE_IFRAME_DESC: 'Copier / Coller ce snippet HTML dans votre site pour afficher cette carte',
			COPY_PAST_LINK_DESC: 'Copier / Coller ce lien HTML dans votre site pour afficher un lien vers cette carte',
			DESCRIPTION: 'Description',
			EDIT_MAP: "Modifier la carte",
			HEIGHT: 'Hauteur',
			INFORMATION: 'Information',
			LAYERS: 'Couches de données',
			LAYERS_AVAILABLE: "Couches de données disponibles",
			LAYERS_DISPLAYED: 'Donnée(s) affichée(s) sur la carte',
			LAYERS_TILE: 'Fonds de carte',
			LOGOUT: 'Se déconnecter',
			MAP: 'Carte',
			NO_SELECTED_MAP: "Aucune carte n'est sélectionnée. Veuillez sélectionner une carte ou en créer une nouvelle.",
			SHARE: 'Partager',
			SNIPPET: 'Code (snippet)',
			TARGET: 'Cible',
			TEXT: 'Texte',
			TITLE: 'Titre',
			WIDTH: 'Largeur',


			NMD_ALL_PROJECTS: 'Tous les projets',
			NMD_SEARCH_PROJECT: 'Rechercher un projet',
			NMD_NO_SELECTED_PROJECT: "Aucun projet n'est sélectionnée. Veuillez sélectionner un projet ou en créer un nouveau.",
			NMD_PROJECT: 'Projet',
			NMD_PROJECT_NAME: 'Nom du projet',
		});
		$translateProvider.preferredLanguage('fr');
}]);
*/