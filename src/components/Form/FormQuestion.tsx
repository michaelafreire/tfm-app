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

type Choice = string;

type LikertRow = {
  id: string;
  label: string;
  value?: string;
};

type Question = {
  id: string;
  label: string;
  type: 'text' | 'multiple-choice' | 'checkbox' | 'number' | 'date' | 'likert' | 'likert-group';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDateChange?: (value: string) => void;
  choice?: Choice[];

  // Likert additions
  likertRows?: LikertRow[];
  likertLabels?: string[];
  likertMinLabel?: string;
  likertMaxLabel?: string;
  onMatrixChange?: (rowId: string, value: string) => void;

  required?: boolean;
};

type FormQuestionProps = {
  question: Question[];
};

const defaultLikert = ["1", "2", "3", "4", "5", "6", "7"];

const likertOptionLabels: Record<string, string> = {
  "1": "not true at all",
  "4": "somewhat true",
  "7": "very true",
};

function renderLikertOptionLabel(option: string) {
  const description = likertOptionLabels[option];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.1 }}>
      <Typography variant="caption">{option}</Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}

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
        <Box key={q.id} sx={{ margin: 2, marginTop: 4 }}>

          <Typography
            variant="body1"
            sx={{ marginBottom: 0.5, whiteSpace: "pre-line" }}
          >
            {renderStrongText(q.label)}
            {q.required && (
              <Box component="span" sx={{ color: 'error.main', marginLeft: 0.5 }}>*</Box>
            )}
          </Typography>

          {/* TEXT */}
          {q.type === "text" && (
            <TextField
              label="Required"
              variant="outlined"
              value={q.value}
              onChange={q.onChange}
              size="small"
            />
          )}

          {/* NUMBER */}
          {q.type === "number" && (
            <TextField
              label="Required"
              variant="outlined"
              type="number"
              value={q.value || ""}
              onChange={q.onChange}
              size="small"
              slotProps={{ input: { inputMode: 'numeric' } }}
            />
          )}

          {/* CHECKBOX */}
          {q.type === "checkbox" && (
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={q.value === "yes"}
                    onChange={q.onChange}
                  />
                }
                label="Required"
              />
            </FormGroup>
          )}

          {/* MULTIPLE CHOICE */}
          {q.type === "multiple-choice" && (
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={q.value || ""}
                onChange={q.onChange}
                name={`radio-${q.id}`}
              >
                {q.choice?.map((c, i) => (
                  <FormControlLabel
                    key={`${q.id}-${i}`}
                    value={c}
                    control={<Radio />}
                    label={renderStrongText(c)}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* DATE */}
          {q.type === "date" && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={['DatePicker']}>
                <DatePicker
                  label={'Select month and year'}
                  views={['month', 'year']}
                  format="MM/YYYY"
                  value={q.value ? dayjs(q.value, 'YYYY-MM') : null}
                  onChange={(value) =>
                    q.onDateChange?.(value ? value.format('YYYY-MM') : '')
                  }
                />
              </DemoContainer>
            </LocalizationProvider>
          )}

          {/* SINGLE LIKERT */}
          {q.type === "likert" && (
            <FormControl component="fieldset">
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Strongly disagree
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Strongly agree
                </Typography>
              </Box>
              <RadioGroup
                row
                value={q.value || ""}
                onChange={q.onChange}
                name={`likert-${q.id}`}
                sx={{ justifyContent: "flex-start", gap: 0.5, px: 0 }}
              >
                {(q.choice && q.choice.length > 0 ? q.choice : defaultLikert).map((option) => (
                  <FormControlLabel
                    key={`${q.id}-${option}`}
                    value={option}
                    control={<Radio size="small" />}
                    label={renderLikertOptionLabel(option)}
                    labelPlacement="bottom"
                    sx={{ margin: 0 }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}

          {/* LIKERT GROUP */}
          {q.type === "likert-group" && (
            <Box sx={{ mt: 1 }}>
              {q.likertRows?.map((row) => {
                return (
                  <Box
                    key={row.id}
                    sx={{
                      mb: 2,
                      p: 1,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      {renderStrongText(row.label)}
                    </Typography>

                    <RadioGroup
                      row
                      value={row.value || ""}
                      onChange={(e) =>
                        q.onMatrixChange?.(row.id, e.target.value)
                      }
                      sx={{ justifyContent: "flex-start", gap: 0.5, px: 0 }}
                    >
                      {(q.likertLabels || defaultLikert).map((option) => (
                        <FormControlLabel
                          key={option}
                          value={option}
                          control={<Radio size="small" />}
                          label={renderLikertOptionLabel(option)}
                          labelPlacement="bottom"
                          sx={{ margin: 0 }}
                        />
                      ))}
                    </RadioGroup>
                  </Box>
                );
              })}
            </Box>
          )}

        </Box>
      ))}
    </Box>
  );
}

export default FormQuestion;
