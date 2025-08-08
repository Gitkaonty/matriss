import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './context/Layout';
import RequireAuth from './context/RequireAuth';
import NotFoundPage from './pages/NotFoundPage';
import Unauthorized from './pages/Unauthorized';
import Login from './Auth/Login';
import PersistLogin from './Auth/PersistLogin';

import MainPage from './pages/MainPage';
import DashboardComponent from './components/menuComponent/Dashboard/Dashboard';
import Home from './components/menuComponent/home/Home';
import SaisieComponent from './components/SaisieComponent';
import ConsultationComponent from './components/ConsultationComponent';
import ImportBalance from './components/menuComponent/administration/import/ImportBalance';
import ImportJournal from './components/menuComponent/administration/import/ImportJournal';
import ImportModelePlanComptable from './components/menuComponent/administration/import/ImportModelePlanComptable';
import ImportAnnexeComponent from './components/ImportAnnexeComponent';
import ImportAnnexeDeclarationFiscaleComponent from './components/ImportAnnexeDeclarationFiscaleComponent';
import ExportBalance from './components/menuComponent/administration/export/ExportBalance';
import DeclarationEbilan from './components/menuComponent/Declaration/Ebilan/DeclarationEbilan';
import RevisionAnomalieEbilanComponent from './components/RevisionAnomalieEbilanComponent';
import RevisionPrecontroleFiscalComponent from './components/RevisionPrecontroleFiscalComponent';
import ParamCodeJournalComponent from './components/menuComponent/Parametrages/CodesJournaux/CodesJournaux';
import ParamPlanComptableComponent from './components/menuComponent/Parametrages/PlanComptable/ParamPlanComptable';
import ParamPCModele from './components/menuComponent/Parametrages/PlanComptableModele/ParamPCModele';
import ParamTVAComponent from './components/menuComponent/Parametrages/Tva/ParamTva';
import ParamDeviseComponent from './components/ParamDeviseComponent';
import ParamExerciceComponent from './components/menuComponent/Parametrages/Exercice/Exercice';
import ParamCRM from './components/menuComponent/Parametrages/crm/ParamCRM';
import ParamMappingComponent from './components/menuComponent/Parametrages/mappingcompte/ParamMapping';
import AnalitiqueComponent from './components/menuComponent/Parametrages/analytiques/AnalitiqueComponent';
import DeclarationComm from './components/menuComponent/Declaration/Dcom/DeclarationComm';
import ClassificationSalariesComponent from './components/ClassificationSalariesComponent';
import PersonnelComponent from './components/PersonnelComponent';
import FonctionsComponent from './components/FonctionsComponent';
import DeclarationIRSAComponent from './components/menuComponent/Declaration/Ebilan/DeclarationIRSAComponent';
import HistoriqueIrsaTable from './components/menuComponent/Declaration/Ebilan/HistoriqueIrsaTable';

const ROLES = {
  'SuperAdmin': 3355,
  'User': 2001,
  'Editor': 1984,
  'Admin': 5150
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />} >
        {/*Publics routes */}
        <Route path='/' element={<Login />} />
        <Route path='/unauthorized' element={<Unauthorized />} />

        {/*Protected routes */}
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={[ROLES.Admin]} />}>
            <Route path='/tab' element={<MainPage />} >
              <Route path='/tab/home' element={<Home />} />
              <Route path='/tab/dashboard/:id' element={<DashboardComponent />} />
              <Route path='/tab/saisie/:id' element={<SaisieComponent />} />
              <Route path='/tab/consultation/:id' element={<ConsultationComponent />} />
              <Route path='/tab/importBalance/:id' element={<ImportBalance />} />
              <Route path='/tab/importJournal/:id' element={<ImportJournal />} />
              <Route path='/tab/importModelePlanComptable' element={<ImportModelePlanComptable />} />
              <Route path='/tab/ImportAnnexe' element={<ImportAnnexeComponent />} />
              <Route path='/tab/importAnnexeDeclarationFiscale' element={<ImportAnnexeDeclarationFiscaleComponent />} />
              <Route path='/tab/exportBalance/:id' element={<ExportBalance />} />
              <Route path='/tab/declarationEbilan/:id' element={<DeclarationEbilan />} />
              <Route path='/tab/declarationDroitComm/:id' element={<DeclarationComm />} />
              <Route path='/tab/revisionAnomalieEbilan' element={<RevisionAnomalieEbilanComponent />} />
              <Route path='/tab/revisionPrecontrolFiscal' element={<RevisionPrecontroleFiscalComponent />} />
              <Route path='/tab/paramCodeJournal/:id' element={<ParamCodeJournalComponent />} />
              <Route path='/tab/paramPlanComptable/:id' element={<ParamPlanComptableComponent />} />
              <Route path='/tab/paramPlanComptableModele' element={<ParamPCModele />} />
              <Route path='/tab/paramTVA/:id' element={<ParamTVAComponent />} />
              <Route path='/tab/paramDevise/:id' element={<ParamDeviseComponent />} />
              <Route path='/tab/paramExercice/:id' element={<ParamExerciceComponent />} />
              <Route path='/tab/paramAnalytique/:id' element={<AnalitiqueComponent />} />
              <Route path='/tab/paramCrm/:id' element={<ParamCRM />} />
              <Route path='/tab/paramMapping/:id' element={<ParamMappingComponent />} />
              <Route path='/tab/paramClassification/:id' element={<ClassificationSalariesComponent />} />
              <Route path='/tab/personnel/:id' element={<PersonnelComponent />} />
              <Route path='/tab/fonctions/:id' element={<FonctionsComponent />} />
              <Route path='/tab/declarationIRSA/:id' element={<DeclarationIRSAComponent />} />
              <Route path='/tab/historiqueIRSA' element={<HistoriqueIrsaTable />} />
            </Route>
          </Route>
        </Route>
        {/* catch all */}
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
