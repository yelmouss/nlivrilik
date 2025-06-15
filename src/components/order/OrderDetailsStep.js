'use client';

import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Chip 
} from '@mui/material';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { useTranslations } from 'next-intl';

export default function OrderDetailsStep({
  orderContent,
  suggestions,
  loadingSuggestions,
  orderContentRef,
  onOrderContentChange,
  onAddSuggestion,
}) {
  const t = useTranslations('Order');

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {t('orderDetails')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('orderDetailsDescription')}
      </Typography>

      <TextField
        required
        fullWidth
        id="orderContent"
        name="orderContent"
        label={t('orderContent')}
        multiline
        rows={6}
        value={orderContent}
        onChange={onOrderContentChange}
        placeholder={t('orderContentPlaceholder')}
        inputRef={orderContentRef}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment
              position="start"
              sx={{ alignSelf: 'flex-start', mt: 2 }}
            >
              <ShoppingBasketIcon />
            </InputAdornment>
          ),
        }}
      />

      {loadingSuggestions && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {suggestions.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {t('suggestions')}:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestions.map((suggestion, index) => (
              <Chip
                key={index}
                label={suggestion}
                onClick={() => onAddSuggestion(suggestion)}
                color="primary"
                variant="outlined"
                icon={<AddShoppingCartIcon />}
                clickable
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
