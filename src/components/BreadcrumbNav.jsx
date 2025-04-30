import React from "react";

const BreadcrumbNav = ({
  breadcrumbs,
  onBreadcrumbClick,
  onNavigateUp,
  canNavigateUp,
}) => {
  return (
    <div className="breadcrumb-nav">
      {canNavigateUp && (
        <button
          className="navigate-up-button"
          onClick={onNavigateUp}
          title="Navigate up"
        >
          <i className="fas fa-arrow-up"></i>
        </button>
      )}

      <div className="breadcrumbs">
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            {index > 0 && <span className="separator">/</span>}
            <span
              className="breadcrumb-item"
              onClick={() => onBreadcrumbClick(breadcrumb.path)}
              title={breadcrumb.name}
            >
              {breadcrumb.name}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbNav;
