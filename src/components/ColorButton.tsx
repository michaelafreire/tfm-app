import Button from '@mui/material/Button';

export default function ColorButton(props: { name: string, onClick?: () => void }) {
  return (
      <Button
        variant="contained"
        color="primary"
        onClick={props.onClick}>
        {props.name}
      </Button>
  );
}
