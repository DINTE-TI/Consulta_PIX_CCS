import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';

const CustomListItem = ({ href, text, icon }) => {
  return (
    <ListItem
      button
      component={Link}
      href={href}
      sx={{
        '& .MuiListItemText-primary': {
          color: '#0a243b',
          fontWeight: 'bold'
        }
      }}>
      <ListItemIcon>
        {icon}
      </ListItemIcon>
      <ListItemText primary={text}/>
    </ListItem>
  );
};

export default CustomListItem;
