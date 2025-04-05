import { GeistSans } from 'geist/font/sans';
import { Card, CardActionArea, CardContent, Typography, CardMedia } from '@mui/material';
import Link from 'next/link';
import InfoIcon from '@mui/icons-material/Info';

const CustomCard = ({ image, title, iconTitle, description, href }) => {
  return (
    <Card sx={{ minWidth: 275, minHeight: 180 }}>
      <CardActionArea component={Link} href={href}>
        <CardMedia
          sx={{ height: 140 }}
          image={image || 'img_card_param.jpg'}
          title="imagem de exemplo"
          alt="imagem de exemplo"
        />
        <CardContent sx={{ minWidth: 275, minHeight: 150 }}>
          <Typography
            variant="h5"
            component="div"
            // align="center"
            padding="10px"
            sx={{
              fontFamily: `${GeistSans.className}`,
              fontWeight: 600,
              fontSize: '1.5rem',
              color: '#0a243b',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {iconTitle} {title}
          </Typography>
          <Typography
            color="#0a243b9e"
            align="justify"
            padding="10px"
            sx={{
              fontFamily: `${GeistSans.className}`,
              fontWeight: 400,
              fontSize: '1rem',
            }}
          >
            <InfoIcon sx={{ marginRight: '8px', marginBottom: '-6px' }} />{description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default CustomCard;
