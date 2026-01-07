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
    default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    hot: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
    cold: 'linear-gradient(135deg, #4ecdc4 0%, #44a8a8 100%)',
    gold: 'linear-gradient(135deg, #f7b733 0%, #fc4a1a 100%)',
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
