
import { Link as RouterLink } from 'react-router-dom';
import { Typography, Link, Breadcrumbs as MUIBreadcrumbs } from '@mui/material';

const handleClick = (event) => {
  event.preventDefault();
}

export default function Breadcrumbs({ breadcrumbs }) {
  return (
    <div role="presentation" onClick={handleClick}>
      <MUIBreadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
        <Link 
          color='success'
          component={RouterLink} 
          to={'/'}
          className="textLink"
          underline='none'
        >
          Start
        </Link>
        {breadcrumbs && (
          breadcrumbs.length > 1 && breadcrumbs.map((crumb, index) => (
            <Link
              color='success'
              key={index}
              component={RouterLink} 
              to={`/admin${crumb.route}`}
              className="textLink"
              underline='none'
            >
              {crumb.title}
            </Link>
          )).slice(0, -1)
        )}
        <Typography color="inherit">
          {breadcrumbs && (
            breadcrumbs[breadcrumbs.length - 1].title
          )}
        </Typography>
      </MUIBreadcrumbs>
    </div>
  );
}