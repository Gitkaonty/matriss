import { Chip, MenuItem, Select, Stack, Tooltip } from "@mui/material";
import { TbCircleLetterCFilled, TbCircleLetterGFilled, TbCircleLetterAFilled } from "react-icons/tb";
import { format } from 'date-fns';
import { BsCheckCircleFill } from "react-icons/bs";
import { PiIdentificationCardFill } from "react-icons/pi";
import { BsPersonFillSlash } from "react-icons/bs";

//Tableau list Modèle Header
const columnHeaderModel = [
    // {
    //   field: 'id', 
    //   headerName: 'ID', 
    //   type: 'number', 
    //   sortable : true, 
    //   width: 70, 
    //   headerAlign: 'right',
    //   headerClassName: 'MuiDataGrid-ColumnHeader'
    // },
    {
      field: 'nom', 
      headerName: "Nom du modèle", 
      type: 'string', 
      sortable : true, 
      width: 800, 
      headerAlign: 'left',
      headerClassName: 'MuiDataGrid-ColumnHeader'
    },
    {
        field: 'pardefault', 
        headerName: "Par défaut", 
        type: 'boolean', 
        sortable : true, 
        width: 100, 
        headerAlign: 'center',
        headerClassName: 'MuiDataGrid-ColumnHeader'
      },
  ]

//Header pour le tableau détail du modèle
const columnHeaderDetail = [
    {
        field: 'id', 
        headerName: 'ID', 
        type: 'number', 
        sortable : true, 
        width: 70, 
        headerAlign: 'right',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'compte', 
        headerName: <strong>Compte</strong>, 
        type: 'string', 
        sortable : true, 
        width: 175, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'libelle', 
        headerName: <strong>Libellé</strong>, 
        type: 'string', 
        sortable : true, 
        width: 300, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
    },
    {
        field: 'nature', 
        headerName: <strong>Nature</strong>, 
        type: 'string', 
        sortable : true, 
        width: 130, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            if(params.row.nature === 'General'){
                return (
                <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>    
                    <Chip 
                    icon={<TbCircleLetterGFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                    label="Général"
                    
                    style={{
                        width: "100%",
                        display: 'flex', // ou block, selon le rendu souhaité
                        justifyContent: 'space-between',
                        backgroundColor: '#48A6A7',
                        color:'white'
                    }}
                    />
                </Stack>
                )
            }else if(params.row.nature === 'Collectif'){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                       
                        <Chip 
                        icon={<TbCircleLetterCFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Collectif"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#A6D6D6',
                            color:'white'
                        }}
                        />
                    </Stack>
                )
            }else{
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                      
                        <Chip 
                        icon={<TbCircleLetterAFilled style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Auxiliaire"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#123458',
                            color:'white'
                        }}
                        />
                    </Stack>
                )
            }
        }
    },
    {
        field: 'BaseAux.comptecentr', 
        headerName: <strong>Centr. / base Aux</strong>, 
        type: 'string', 
        sortable : true, 
        width: 175, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'cptcharge', 
        headerName: <strong>Cpt charge</strong>, 
        type: 'string', 
        sortable : true, 
        width: 100, 
        headerAlign: 'right',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            if(params.row.cptcharge === 0){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div style={{
                            width: 25,             
                            height: 25,            
                            backgroundColor: '#DBDBDB', 
                            borderRadius: 15,        
                            display: 'flex',            
                            justifyContent: 'center',   
                            alignItems: 'center',       
                        }}>
                            {params.row.cptcharge}
                        </div>
                    </Stack>
                )
            }else{
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div style={{
                            width: 25,             
                            height: 25,            
                            backgroundColor: '#FDA403', 
                            borderRadius: 15,        
                            display: 'flex',            
                            justifyContent: 'center',   
                            alignItems: 'center',       
                        }}>
                        {params.row.cptcharge}
                    </div>
                    </Stack>
                    
                )
            }
        }
    },
    {
        field: 'cpttva', 
        headerName: <strong>Cpt TVA</strong>, 
        type: 'string', 
        sortable : true, 
        width: 100, 
        headerAlign: 'right',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            if(params.row.cpttva === 0){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div style={{
                            width: 25,             
                            height: 25,            
                            backgroundColor: '#DBDBDB', 
                            borderRadius: 15,        
                            display: 'flex',            
                            justifyContent: 'center',   
                            alignItems: 'center',       
                        }}>
                            {params.row.cpttva}
                        </div>
                    </Stack>
                )
            }else{
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div style={{
                            width: 25,             
                            height: 25,            
                            backgroundColor: '#FDA403', 
                            borderRadius: 15,        
                            display: 'flex',            
                            justifyContent: 'center',   
                            alignItems: 'center',       
                        }}>
                            {params.row.cpttva}
                        </div>
                    </Stack>
                    
                )
            }
        }
    },
    {
        field: 'typetier', 
        headerName: <strong>Type de tier</strong>, 
        type: 'string', 
        sortable : true, 
        width: 130, 
        headerAlign: 'center',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            if(params.row.typetier === 'sans-nif'){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <Chip 
                        icon={<BsPersonFillSlash style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Sans NIF"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#FF9149',
                            color:'white'
                        }}
                        />
                    </Stack>
                )
            }else if(params.row.typetier === 'avec-nif'){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <Chip 
                        icon={<PiIdentificationCardFill style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Avec NIF"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#006A71',
                            color:'white'
                        }}
                        />
                    </Stack>
                )
            }else if(params.row.typetier === 'general'){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <Chip 
                        icon={<BsCheckCircleFill style={{color: 'white', width: 18, height:18, marginLeft:10}}/>} 
                        label="Général"
                        
                        style={{
                            width: "100%",
                            display: 'flex', // ou block, selon le rendu souhaité
                            justifyContent: 'space-between',
                            backgroundColor: '#67AE6E',
                            color:'white'
                        }}
                        />
                    </Stack>
                )
            }else if(params.row.typetier === 'etranger'){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div style={{
                            width: 90,             
                            height: 25,            
                            backgroundColor: '#FBA518', 
                            borderRadius: 15,        
                            display: 'flex',            
                            justifyContent: 'center',   
                            alignItems: 'center',       
                        }}>
                            {/* {params.row.typetier} */}
                            Etranger
                        </div>
                    </Stack>
                )
            }
        }
    },
    {
        field: 'nif', 
        headerName: <strong>Nif</strong>, 
        type: 'string', 
        sortable : true, 
        width: 150, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'statistique', 
        headerName: <strong>N° statistique</strong>, 
        type: 'string', 
        sortable : true, 
        width: 200, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'adresse', 
        headerName: <strong>Adresse</strong>, 
        type: 'string', 
        sortable : true, 
        width: 250, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'cin', 
        headerName: <strong>CIN</strong>, 
        type: 'string', 
        sortable : true, 
        width: 150, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'datecin', 
        headerName: <strong>date CIN</strong>, 
        type: 'text', 
        sortable : true, 
        width: 120, 
        headerAlign: 'center',
        headerClassName: 'HeaderbackColor',
        renderCell: (params) => {
            if(params.row.datecin !== null){
                return (
                    <Stack width={'100%'} style={{display:'flex',alignContent:'center', alignItems:'center', justifyContent:'center'}}>
                        <div>{format(params.row.datecin, "dd/MM/yyyy")}</div>
                    </Stack>
                )
            }
        }
    },
    {
        field: 'autrepieceid', 
        headerName: <strong>Autre pièces Ident.</strong>, 
        type: 'text', 
        sortable : true, 
        width: 200, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'refpieceid', 
        headerName: <strong>Réf pièces Ident.</strong>, 
        type: 'text', 
        sortable : true, 
        width: 200, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'adressesansnif', 
        headerName: <strong>Adresse CIN</strong>, 
        type: 'text', 
        sortable : true, 
        width: 250, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'nifrepresentant', 
        headerName: <strong>NIF représentant</strong>, 
        type: 'text', 
        sortable : true, 
        width: 175, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'addresseetranger', 
        headerName: <strong>adresse représentant</strong>, 
        type: 'text', 
        sortable : true, 
        width: 250, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'pays', 
        headerName: <strong>Pays</strong>, 
        type: 'text', 
        sortable : true, 
        width: 150, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    },
    {
        field: 'motcle', 
        headerName: <strong>Mot clé</strong>, 
        type: 'string', 
        sortable : true, 
        width: 150, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor'
    }
  ]

  //données pour le tableau compte de charge détail pour ajout infos nouveau détail du modèle sélectionné
const columnHeaderAddNewRowModelDetail = [
    // {
    //   field: 'id', 
    //   headerName: 'ID', 
    //   type: 'number', 
    //   sortable : true, 
    //   width: 70, 
    //   headerAlign: 'right',
    //   headerClassName: 'HeaderbackColor'
    // },
    {
      field: 'compte', 
      headerName: "Compte", 
      type: 'string', 
      sortable : true, 
      width: 200, 
      headerAlign: 'left',
      headerClassName: 'HeaderbackColor',
      editable: false,
    },
    {
        field: 'libelle', 
        headerName: "Libellé", 
        type: 'string', 
        sortable : true, 
        width: 850, 
        headerAlign: 'left',
        headerClassName: 'HeaderbackColor',
        editable: false
      },
  ]
  
export default { columnHeaderModel, columnHeaderDetail, columnHeaderAddNewRowModelDetail };