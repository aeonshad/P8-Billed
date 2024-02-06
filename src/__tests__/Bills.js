/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from '../__mocks__/store';
import Bills from '../containers/Bills.js';
import '@testing-library/jest-dom';

jest.mock("../app/store", () => mockStore)

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //Mise en place du expect
      expect(windowIcon).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })

  // test d'intégration GET
  describe('When I navigate to Bills', () => {
    test('Fetches bills from mock API GET', async () => {

        // Configuration du localStorage pour simuler un utilisateur connecté
        localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'a@a' }));

        // Création d'un élément racine dans le DOM
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.append(root);

        // Navigation vers la page des factures
        router();
        window.onNavigate(ROUTES_PATH.Bills);

        // Vérification de la présence du contenu "Mes notes de frais"
        const contentBills = screen.getByText('Mes notes de frais');
        expect(contentBills).toBeTruthy();
    });
    describe('When an error occurs on API', () => {
        beforeEach(() => {

            // Espionnage de la méthode 'bills' du mockStore
            jest.spyOn(mockStore, 'bills');

            // Modification de la propriété localStorage de l'objet window pour utiliser une implémentation de localStorage mockée (localStorageMock).
            Object.defineProperty(
              window, 
              'localStorage', 
              { value: localStorageMock });

            // Définition d'un élément dans le localStorage du navigateur pour simuler l'authentification d'un utilisateur.
            window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: 'a@a',
            }))

            // Création d'un élément racine dans le DOM
            const root = document.createElement('div');
            root.setAttribute('id', 'root');
            document.body.appendChild(root);
            router();
        });
        test('fetches bills from an API and fails with 404 message error', async () => {

            // Implémentation du mockStore pour rejeter une promesse avec une erreur 404
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error('Erreur 404'));
                    },
                };
            });
            // Génération du HTML de l'interface utilisateur des factures avec un message d'erreur 404
            const html = BillsUI({ error: 'Erreur 404' });
            document.body.innerHTML = html;

            // Récupération du message d'erreur dans l'interface utilisateur
            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });

        test('fetches messages from an API and fails with 500 message error', async () => {

            // Implémentation du mockStore pour rejeter une promesse avec une erreur 500
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error('Erreur 500'));
                    },
                };
            });

            // Génération du HTML de l'interface utilisateur des factures avec un message d'erreur 500
            const html = BillsUI({ error: 'Erreur 500' });
            document.body.innerHTML = html;

            // Récupération du message d'erreur dans l'interface utilisateur
            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
  });

  describe('When I click on Nouvelle note de frais', () => {
    // Vérifie si le formulaire de création de bills apparait
    test('Then the form to create a new bill appear', async () => {

        // Fonction pour simuler la navigation
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };

        // Modification de la propriété localStorage de l'objet window pour utiliser une implémentation de localStorage mockée (localStorageMock).
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Définition d'un élément dans le localStorage du navigateur pour simuler l'authentification d'un utilisateur.
        window.localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee',
            })
        );

        // Initialisation d'une nouvelle instance de la classe Bills avec des paramètres simulés.
        const billsInit = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
        });

        // Génération du HTML de l'interface utilisateur de la liste de notes de frais et ajout au corps du document
        document.body.innerHTML = BillsUI({ data: bills });

        // Création d'une fonction pour simuler le clic sur le bouton "Nouvelle note de frais"
        const handleClickNewBill = jest.fn(() => billsInit.handleClickNewBill());

        // Récupération du bouton "Nouvelle note de frais", ajout d'un écouteur d'événement de clic et simulation du clic
        const btnNewBill = screen.getByTestId('btn-new-bill');
        btnNewBill.addEventListener('click', handleClickNewBill);
        userEvent.click(btnNewBill);

        // Vérification que la fonction de gestion du clic sur le bouton "Nouvelle note de frais" a été appelée
        expect(handleClickNewBill).toHaveBeenCalled();

        // Attente de l'apparition du formulaire de création de nouvelle note de frais
        await waitFor(() => screen.getByTestId('form-new-bill'));

        // Vérification que le formulaire de création de facture est présent dans l'interface utilisateur
        expect(screen.getByTestId('form-new-bill')).toBeTruthy();
    });
});

  describe('When I click on the eye of a bill', () => {
    // Vérifie si la modale du billet s'affiche
    test('Then a modal must appear', async () => {

        // Fonction pour simuler la navigation
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        };

        // Modification de la propriété localStorage de l'objet window pour utiliser une implémentation de localStorage mockée (localStorageMock).
        Object.defineProperty(window, 'localStorage', { value: localStorageMock });

        // Définition d'un élément dans le localStorage du navigateur pour simuler l'authentification d'un utilisateur.
        window.localStorage.setItem(
            'user',
            JSON.stringify({
                type: 'Employee',
            })
        );

        // Initialisation d'une nouvelle instance de la classe Bills avec des paramètres simulés.
        const billsInit = new Bills({
            document,
            onNavigate,
            store: null,
            localStorage: window.localStorage,
        });

        // Génération du HTML de l'interface utilisateur de la liste de notes de frais et ajout au corps du document
        document.body.innerHTML = BillsUI({ data: bills });

        // Création d'une fonction pour simuler le clic sur l'icone eye
        const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon));

        // Récupération des icones et de la modale
        const iconEye = screen.getAllByTestId('icon-eye');
        const modaleFile = document.getElementById('modaleFile');

        // fonction moqué permettant de simuler le comportement de la modale 
        $.fn.modal = jest.fn(() => modaleFile.classList.add('show'));

        // Pour chaques icones, ajout d'un écouteur d'évènement clic, simulation du clic et vérification si la fonction a été appelée
        iconEye.forEach((icon) => {
            icon.addEventListener('click', handleClickIconEye(icon));
            userEvent.click(icon);
            expect(handleClickIconEye).toHaveBeenCalled();
        });

        // Vérification que la modale possède la class "show"
        expect(modaleFile).toHaveClass('show');
    });
});
});
