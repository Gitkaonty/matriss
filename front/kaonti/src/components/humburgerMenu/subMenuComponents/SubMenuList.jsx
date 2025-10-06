import * as React from 'react';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { useLocation } from "react-router-dom";

export default function SubMenuList({ list, navigatePath }) {
  const [fileId, setFileId] = useState(0);
  const location = useLocation();
  let idDossier;
  useEffect(() => {
    idDossier = sessionStorage.getItem("fileId");
    setFileId(idDossier);
  }, []);

  const navigateToPage = (item) => {
    if (item.urldynamic == true) {
      const path = `${item.path}/${fileId}`;
      navigatePath(path);
    } else {
      const path = item.path;
      navigatePath(path);
    }
  }

  return (
    <List style={{ width: '100%' }}>
      {list?.map(item => (
        <ListItem key={item.name} onClick={() => navigateToPage(item)}>
          <ListItemButton style={{
            backgroundColor: location.pathname.startsWith(item.path)
              ? "rgba(241, 218, 230, 0.3)"
              : "transparent", marginBottom: '-12px', borderRadius: '5px'
          }}>
            <Typography variant='h8' color={"white"}>{item.text}</Typography>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
