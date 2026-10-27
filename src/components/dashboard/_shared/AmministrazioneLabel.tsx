/** Intestazione del perimetro: "Amministrazione: <nome>" oppure "Totale PA". */
export const AmministrazioneLabel = ({ nome }: { nome?: string | null }) =>
  nome ? (
    <>
      Amministrazione: <span className="text-primary">{nome}</span>
    </>
  ) : (
    <>Totale PA</>
  );
