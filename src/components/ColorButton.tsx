import Button from '@mui/material/Button';

export default function ColorButton(props: {
  name: string;
  disabled: boolean;
  onClick?: () => void;
}) {
  return (
    <Button
      variant="contained"
      color="primary"
      disabled={props.disabled}
      onClick={props.onClick}
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
