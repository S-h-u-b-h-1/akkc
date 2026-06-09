const fs = require('fs');
const content = fs.readFileSync('backend/src/routes/adminRoutes.js', 'utf8');

const newRoute = `
router.get(
  '/tasks/:id/bill-pdf',
  authenticate,
  adminOnly,
  validateRequest(taskIdParamSchema),
  asyncHandler(viewTaskBillPdf)
);
`;

const updated = content.replace(
  "asyncHandler(getTask)\n);",
  "asyncHandler(getTask)\n);" + newRoute
);

fs.writeFileSync('backend/src/routes/adminRoutes.js', updated);
