import { Box, Avatar } from '@mui/material'

interface NumbersBallProps {
  numbers: number[]
  size?: 'small' | 'medium' | 'large'
  gradient?: 'default' | 'hot' | 'cold' | 'gold'
}

export default function NumbersBall({ numbers, size = 'medium', gradient = 'default' }: NumbersBallProps) {
  const sizes = {
    small: 40,
    medium: 50,
    large: 60,
  }

  const gradients = {
    default: 'linear-gradient(135deg, #78909c 0%, #546e7a 100%)', // Szary jak tekst
    hot: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)',      // Czerwony
    cold: 'linear-gradient(135deg, #0288d1 0%, #01579b 100%)',     // Niebieski
    gold: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)',     // Pomarańczowy
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {numbers.map((num, index) => (
        <Avatar
          key={index}
          sx={{
            width: sizes[size],
            height: sizes[size],
            background: gradients[gradient],
            fontWeight: 'bold',
            fontSize: size === 'small' ? '1rem' : size === 'large' ? '1.5rem' : '1.2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'transform 0.3s',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {num}
        </Avatar>
      ))}
    </Box>
  )
}
