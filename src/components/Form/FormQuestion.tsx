import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

type FormQuestionProps = {
  question: Question[];
};

function FormQuestion({ question }: FormQuestionProps) {
  return (
    <Box>
      {question.map((q) => (
        <Box key={q.id} sx={{
          margin: 2
        }}>
          <Typography
            variant="body1"
            sx={{ marginTop: 1, marginBottom: 1 }}>
            {q.label}
          </Typography>
          {q.type === "text" &&
            <TextField
              required id="outlined-basic"
              label="Required"
              variant="outlined"
              value={q.value}
              onChange={q.onChange}
            />
          }
          {q.type === "number" && (
            <TextField
              required
              id='outlined-number'
              label="Required"
              variant="outlined"
              type="number"
              slotProps={{ input: { inputMode: 'numeric' } }}
            />
          )}
          {q.type === "checkbox" &&
          <FormGroup>
            <FormControlLabel required control={<Checkbox />} label="Required" />
          </FormGroup>
          }
          {q.type === "multiple-choice" && <FormControl>
            <RadioGroup
              row
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              <FormControlLabel value="female" control={<Radio />} label="Female" />
              <FormControlLabel value="male" control={<Radio />} label="Male" />
              <FormControlLabel value="other" control={<Radio />} label="Other" />
            </RadioGroup>
          </FormControl>
          }
        </Box>
      ))}
    </Box>
  )
}

export default FormQuestion
