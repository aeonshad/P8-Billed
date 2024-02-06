import { fireEvent, screen } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockStore from '../__mocks__/store';
import { ROUTES } from '../constants/routes';
import { localStorageMock } from '../__mocks__/localStorage.js';
import userEvent from '@testing-library/user-event';

describe('Given I am connected as an employee', () => {
    describe('When I submit a new Bill', () => {
        // Vérifie si un fichier est bien chargé
        test('Then verify the file bill', async () => {

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
      
          // Génération du HTML de l'interface utilisateur de la création de nouvelle note de frais (NewBillUI) et ajout au corps du document.
          const html = NewBillUI();
          document.body.innerHTML = html;
      
          // Initialisation d'une nouvelle instance de la classe NewBill avec des paramètres simulés.
          const newBillInit = new NewBill({
              document,
              onNavigate,
              store: mockStore,
              localStorage: window.localStorage,
          });
      
          // Création d'un nouveau fichier fictif à utiliser dans le test.
          const file = new File(['image'], 'image.png', { type: 'image/png' });
      
          // Création d'une fonction pour simuler le changement de fichier.
          const handleChangeFile = jest.fn((e) => newBillInit.handleChangeFile(e));
      
          // Récupération de l'élément dans l'interface utilisateur avec l'attribut de test 'file' et simulation de l'upload d'un fichier.
          const billFile = screen.getByTestId('file');
          userEvent.upload(billFile, file);
      
          // Appel de la fonction de gestion du changement de fichier avec un événement simulé.
          handleChangeFile({ preventDefault: jest.fn(), target: { value: 'image.png' } });
      
          // Vérification que le nom du fichier est défini.
          expect(billFile.files[0].name).toBeDefined();
      
          // Vérification que la variable 'file' est égale au fichier en cours, et que le nom du fichier est 'image.png'.
          expect(newBillInit.file).toEqual(file);
          expect(newBillInit.fileName).toEqual('image.png');
      
          // Vérification que la fonction de gestion du changement de fichier a été appelée.
          expect(handleChangeFile).toBeCalled();
      
          // Récupération du formulaire de création de note de frais, ajout d'un écouteur d'événement de soumission, puis simulation de la soumission du formulaire.
          const formNewBill = screen.getByTestId('form-new-bill');
          const handleSubmit = jest.fn((e) => newBillInit.handleSubmit(e));
          formNewBill.addEventListener('submit', handleSubmit);
          fireEvent.submit(formNewBill);
      
          // Vérification que la fonction de gestion de la soumission du formulaire a été appelée.
          expect(handleSubmit).toHaveBeenCalled();
      });
    });
});