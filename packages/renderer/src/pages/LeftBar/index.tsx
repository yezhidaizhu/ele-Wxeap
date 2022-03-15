import styles from './styles.module.scss';
import IconButton from '@mui/material/IconButton';
import { Apps, List, Message, ContactMail, Person } from '@mui/icons-material';

export default function Bar() {
  const btns = [
    {
      Comp: Apps,
    },
    {
      Comp: List,
    },
    {
      Comp: Message,
    },
    {
      Comp: ContactMail,
    },
    {
      Comp: Person,
    },
  ];
  return (
    <div className={styles.bar}>
      {
        btns.map(({ Comp }, index) => (
          <IconButton key={index} color="primary">
            <Comp />
          </IconButton>
        ))
      }
    </div>
  );
}