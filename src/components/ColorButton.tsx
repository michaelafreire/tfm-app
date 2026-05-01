import Button from '@mui/material/Button';

export default function ColorButton(props: {
  name: string;
  disabled: boolean;
  onClick?: () => void;
  fullWidth?: boolean;
}) {
  return (
    <Button
      variant="contained"
      color="primary"
      disabled={props.disabled}
      onClick={props.onClick}
      fullWidth={props.fullWidth}
      sx={{
        '&.Mui-disabled': {
          bgcolor: 'grey.400',
          color: 'grey.700',
        },
      }}
    >
      {props.name}
    </Button>
  );
}
