/* 
 * TABLE THEME IMPLEMENTATION GUIDE
 * 
 * The following CSS variables and classes have been added to themes.css
 * to provide consistent table styling across all pages.
 */

/* 
 * CSS Variables Available:
 * --table-header-bg: #28243D (Dark purple background)
 * --table-header-text: #E0D6FF (Light purple text)
 * --table-header-border: #3D3551 (Purple border)
 * --table-row-hover: #F8F9FA (Light gray hover)
 * --table-border: #E5E7EB (Light border)
 */

/* 
 * Automatic Overrides:
 * The following classes are automatically styled:
 * - thead.bg-gray-50 → Dark purple background
 * - thead th → Dark purple background with light text
 * - thead th.text-gray-500 → Light purple text
 * - thead th.text-gray-700 → Light purple text
 * - thead th.text-gray-900 → Light purple text
 */

/* 
 * Manual Classes Available:
 * .table-header - Apply to thead element
 * .table-row:hover - Apply to tbody tr elements
 * .table-border - Apply to table borders
 */

/* 
 * Example Usage:
 * 
 * <table class="min-w-full divide-y divide-gray-200">
 *   <thead class="bg-gray-50">  <!-- Automatically styled -->
 *     <tr>
 *       <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
 *         Column Name
 *       </th>
 *     </tr>
 *   </thead>
 *   <tbody class="bg-white divide-y divide-gray-200">
 *     <tr class="hover:bg-gray-50">  <!-- Optional: add hover effect -->
 *       <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
 *         Data
 *       </td>
 *     </tr>
 *   </tbody>
 * </table>
 */

/* 
 * Files That Will Be Automatically Updated:
 * - src/app/modules/organization/pages/users/users.component.html
 * - src/app/modules/organization/pages/service-centers/service-centers.component.html
 * - src/app/modules/organization/pages/customers/customers.component.html
 * - src/app/modules/organization/pages/service-redemption/service-redemption.component.html
 * - src/app/modules/reports/pages/service-center-performance/service-center-performance.component.html
 * - src/app/modules/organization/pages/invoices/invoices.component.html
 * - src/app/modules/reports/pages/service-usage-report/service-usage-report.component.html
 * - src/app/modules/reports/pages/sales-report/sales-report.component.html
 * - src/app/modules/organization/pages/customer-profile/customer-profile.component.html
 */
