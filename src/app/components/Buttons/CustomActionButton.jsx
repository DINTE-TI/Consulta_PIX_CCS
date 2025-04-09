import { Button } from '@mui/material';
import { GeistSans } from 'geist/font/sans';
const CustomActionButton = ({ icon, text }) => {
  return (
    <Button
      style={{ marginInlineEnd: 20 }}
      variant="contained"
      size="small"
      sx={{
        fontFamily: `${GeistSans.className}`,
        fontSize: '14px',
        fontWeight: 'bold',
        backgroundColor: '#0a243b',
        '&:hover': {
          backgroundColor: '#1a344b'
        },
        '&:active': {
          backgroundColor: '#0a243b'
        }
      }}>
      {icon} {text}
    </Button>
  );
};

export default CustomActionButton;
