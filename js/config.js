/* Backup: exportar, importar e apagar dados */

MK.renderShell("config");
document.getElementById("icone").innerHTML = MK.art.banana(32);

document.getElementById("exportar").addEventListener("click", () => {
  const dump = MK.exportAll();
  const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `monekyfi-backup-${MK.todayISO()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  MK.toast("Backup baixado! Guarde bem. 🍌");
});

document.getElementById("importar").addEventListener("click", () => {
  const arquivo = document.getElementById("arquivo").files[0];
  if (!arquivo) { MK.toast("Escolha um arquivo de backup primeiro."); return; }
  const leitor = new FileReader();
  leitor.onload = () => {
    try {
      const dump = JSON.parse(leitor.result);
      if (!confirm("Importar este backup? Os dados atuais deste navegador serão substituídos.")) return;
      MK.importAll(dump);
      MK.toast("Backup importado! 🎉");
      setTimeout(() => location.href = "index.html", 900);
    } catch (err) {
      alert("Não deu pra importar: " + err.message);
    }
  };
  leitor.readAsText(arquivo);
});

document.getElementById("apagar-tudo").addEventListener("click", () => {
  if (!confirm("Tem certeza? Isso apaga TODOS os dados do Monekyfi neste navegador.")) return;
  if (!confirm("Última chance: apagar tudo mesmo?")) return;
  MK.clearAll();
  MK.toast("Tudo apagado. Selva zerada.");
  setTimeout(() => location.href = "index.html", 900);
});
