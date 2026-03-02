import { useState, useEffect } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import { matchPath, useLocation } from "react-router-dom";
import { init } from '../../../../init';

export default function SubMenuList({ list, navigatePath }) {
  const [fileId, setFileId] = useState(0);
  const location = useLocation();
  let initial = init[0];
  let idDossier;

  useEffect(() => {
    idDossier = sessionStorage.getItem("fileId");
    setFileId(idDossier);
  }, []);

  const navigateToPage = (item) => {
    console.log('Navigating:', item.text, 'urldynamic:', item.urldynamic, 'type:', typeof item.urldynamic, 'fileId:', fileId);
    if (item.urldynamic === true) {
      const validFileId = fileId && fileId !== 'null' && !isNaN(fileId) ? fileId : 0;
      const path = `${item.path}/${validFileId}`;
      console.log('Dynamic path:', path);
      navigatePath(path);
    } else {
      const path = item.path;
      console.log('Static path:', path);
      navigatePath(path);
    }
  }

  return (
    <List style={{ width: "100%" }}>
      {list.map((item) => {
        const isActive = matchPath({ path: item.path, end: false }, location.pathname);

        return (
          <ListItem key={item.text} onClick={() => navigateToPage(item)}>
            <ListItemButton
              style={{
                backgroundColor: isActive
                  ? "rgba(241, 218, 230, 0.3)"
                  : "transparent",
                borderRadius: "5px",
                marginBottom: "-12px",
              }}
            >
              <Typography variant="h8" color={initial.text_theme}>
                {item.text}
              </Typography>
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  )
}
