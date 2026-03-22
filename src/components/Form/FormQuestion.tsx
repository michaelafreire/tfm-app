import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import TextField from '@mui/material/TextField';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

type Choice = string

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number' | 'date';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (value: string) => void;
  choice?: Choice[];
  required?: boolean;
};

type FormQuestionProps = {
  question: Question[];
};

function renderStrongText(text: string) {
  const parts = text.split(/(<strong>.*?<\/strong>)/g).filter(Boolean);

  return parts.map((part, index) => {
    const match = part.match(/^<strong>(.*?)<\/strong>$/);
    if (match) {
      return (
        <Box component="span" key={`strong-${index}`} sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          {match[1]}
        </Box>
      );
    }

    return part;
  });
}

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
              whiteSpace: "pre-line",
            }}>
            {renderStrongText(q.label)}
            {q.required && (
              <Box component="span" sx={{ color: 'error.main', marginLeft: 0.5 }}>*</Box>
            )}
          </Typography>
          {q.type === "text" &&
            <TextField
              id="outlined-basic"
              label="Required"
              variant="outlined"
              value={q.value}
              onChange={q.onChange}
              size="small"
            />
          }
          {q.type === "number" && (
            <TextField
              id='outlined-number'
              label="Required"
              variant="outlined"
              type="number"
              value={q.value || ""}
              onChange={q.onChange}
              size="small"
              slotProps={{ input: { inputMode: 'numeric' } }}
            />
          )}
          {q.type === "checkbox" &&
            <FormGroup>
              <FormControlLabel
              control={(
                <Checkbox
                  checked={q.value === "yes"}
                  onChange={q.onChange}
                />
              )}
              label="Required"
              />
            </FormGroup>
          }
          {q.type === "multiple-choice" && <FormControl component="fieldset" variant="standard">
            <RadioGroup
              row
              value={q.value || ""}
              onChange={q.onChange}
              aria-labelledby="demo-row-radio-buttons-group-label"
              name={`radio-group-${q.id}`}
            >
              {
                q.choice?.map((c, i) => (
                  <FormControlLabel key={`${q.id}-${i}`} value={c} control={<Radio />} label={renderStrongText(c)} />
                ))
              }
            </RadioGroup>
          </FormControl>
          }
          {q.type === "date" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label={'Select month and year'}
                  views={['month', 'year']}
                  format="MM/YYYY"
                  value={q.value ? dayjs(q.value, 'YYYY-MM') : null}
                  onChange={(value) => q.onDateChange?.(value ? value.format('YYYY-MM') : '')}
                />
              </DemoContainer>
            </LocalizationProvider>
          )}
        </Box>
      ))}
    </Box>
  )
}

export default FormQuestion
