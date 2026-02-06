import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

type Choice = string

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  choice?: Choice[];
};

type FormQuestionProps = {
  question: Question[];
};

function FormQuestion({ question }: FormQuestionProps) {
  return (
    <Box>
      {question.map((q) => (
        <Box key={q.id} sx={{
          margin: 2,
          marginTop: 4,
        }}>
          <Typography
            variant="body1"
            sx={{
              marginBottom: 0.5,
            }}>
            {q.label}
          </Typography>
          {q.type === "text" &&
            <TextField
              required id="outlined-basic"
              label="Required"
              variant="outlined"
              value={q.value}
              onChange={q.onChange}
              size="small"
            />
          }
          {q.type === "number" && (
            <TextField
              required
              id='outlined-number'
              label="Required"
              variant="outlined"
              type="number"
              size="small"
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
              value={q.value || ""}
              onChange={q.onChange}
              aria-labelledby="demo-row-radio-buttons-group-label"
              name="row-radio-buttons-group"
            >
              {
                q.choice?.map((c, i) => (
                  <FormControlLabel key={`${q.id}-${i}`} value={c} control={<Radio />} label={c} />
                ))
              }
            </RadioGroup>
          </FormControl>
          }
        </Box>
      ))}
    </Box>
  )
}

export default FormQuestion
