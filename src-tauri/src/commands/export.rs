use crate::database::Database;
use tauri::State;

#[tauri::command]
pub async fn export_to_excel(
    db: State<'_, Database>,
    file_path: String,
) -> Result<String, String> {
    // Get todos from database
    let todos = db.get_all_todos().await?;

    // Create Excel workbook
    let mut workbook = rust_xlsxwriter::Workbook::new();
    let worksheet = workbook.add_worksheet();

    // Headers
    worksheet.write_string(0, 0, "Content").map_err(|e| e.to_string())?;
    worksheet.write_string(0, 1, "Status").map_err(|e| e.to_string())?;
    worksheet.write_string(0, 2, "Priority").map_err(|e| e.to_string())?;
    worksheet.write_string(0, 3, "Created At").map_err(|e| e.to_string())?;
    worksheet.write_string(0, 4, "Completed At").map_err(|e| e.to_string())?;

    // Data rows
    for (idx, todo) in todos.iter().enumerate() {
        let row = (idx + 1) as u32;
        worksheet.write_string(row, 0, &todo.content).map_err(|e| e.to_string())?;
        worksheet.write_string(row, 1, if todo.completed { "Done" } else { "Todo" }).map_err(|e| e.to_string())?;
        worksheet.write_number(row, 2, todo.priority as f64).map_err(|e| e.to_string())?;
        worksheet.write_string(row, 3, &todo.created_at).map_err(|e| e.to_string())?;
        worksheet.write_string(row, 4, todo.completed_at.as_deref().unwrap_or("")).map_err(|e| e.to_string())?;
    }

    workbook.save(&file_path).map_err(|e| e.to_string())?;
    Ok(file_path)
}