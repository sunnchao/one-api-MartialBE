const styles = {
  width: '100%',
  maxWidth: '100%',
  paddingLeft: 0,
  paddingRight: 0
};

const AdminContainer = ({ children, style }) => {
  return (
    <div style={{ ...styles, ...style }}>
      {children}
    </div>
  );
};

export default AdminContainer;
